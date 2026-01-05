pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES') // Prevent infinite hangs
    }
    
    environment {
        // Use your DockerHub credentials ID
        DOCKER_CREDS = 'dockerhub-cred'
        DOCKER_IMAGE = 'lilstex/elevate-cv-api'
        // These come from Jenkins Global Environment Variables
        DATABASE_URI = "${env.DATABASE_URI}"
        JWT_SECRET = "${env.JWT_SECRET}"
        OPENAI_API_KEY = "${env.OPENAI_API_KEY}"
        TOKEN_VALIDATION_DURATION = "${env.TOKEN_VALIDATION_DURATION}"
    }

    stages {
        stage('Source') {
            steps {
                git branch: 'main', credentialsId: 'github-cred', url: 'https://github.com/lilstex/elevate-cv.git'
            }
        }

        stage('Build Image') {
            steps {
                sh """
                docker build \
                  --memory=1g \
                  --memory-swap=2g \
                  -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .
                """

                sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDS) {
                        sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh """
                export BUILD_NUMBER=${BUILD_NUMBER}

                docker-compose pull
                docker-compose up -d --remove-orphans
                """
            }
        }

        stage('Cleanup') {
            steps {
                sh """
                docker image prune -f
                docker container prune -f
                """
            }
        }
    }
}
pipeline {
    agent any
    
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

        stage('Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
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
                script {
                    // Use docker-compose to pull the new image and restart the service
                    sh "BUILD_NUMBER=${BUILD_NUMBER} docker-compose -f docker-compose.yml up -d"
                    
                    // Cleanup old images to save VPS space
                    sh "docker image prune -f"
                }
            }
        }
    }
}
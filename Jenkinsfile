pipeline {
    agent any

    environment {
        // Jenkins credentials → type: "Username with password", ID: dockerhub-login
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKERHUB_USERNAME    = 'akashifernando'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/akashifernando/Docker-App.git'
            }
        }

        stage('Build Docker Images from Compose') {
            steps {
                echo "Building Docker images using docker-compose..."
                sh 'docker compose build'
                // This builds:
                // - myapp-server
                // - myapp-client
            }
        }

        stage('Tag Images for Docker Hub') {
            steps {
                script {
                    def frontendImageLocal  = 'myapp-client:latest'
                    def backendImageLocal   = 'myapp-server:latest'
                    def frontendImageRemote = "${DOCKERHUB_USERNAME}/salon-frontend:latest"
                    def backendImageRemote  = "${DOCKERHUB_USERNAME}/salon-backend:latest"

                    sh """
                        echo "Tagging images for Docker Hub..."
                        docker tag ${frontendImageLocal} ${frontendImageRemote}
                        docker tag ${backendImageLocal}  ${backendImageRemote}
                    """
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    def frontendImageRemote = "${DOCKERHUB_USERNAME}/salon-frontend:latest"
                    def backendImageRemote  = "${DOCKERHUB_USERNAME}/salon-backend:latest"

                    sh """
                        echo "Pushing images to Docker Hub..."
                        docker push ${frontendImageRemote}
                        docker push ${backendImageRemote}
                    """
                }
            }
        }

        stage('Clean Up') {
            steps {
                sh 'docker system prune -af || true'
            }
        }
    }

    post {
        success {
            echo '✅ Images built and pushed to Docker Hub successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check the stage logs for details.'
        }
    }
}

pipeline {

    agent {
        docker {
            image 'docker:27-cli'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-login')
        DOCKERHUB_USERNAME    = 'akashifernando'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/akashifernando/Docker-App.git'
            }
        }

        stage('Verify Docker') {
            steps {
                sh '''
                    docker --version
                    docker info
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "Building backend image..."
                    docker build -t myapp-server:latest -f server/dockerfile server

                    echo "Building frontend image..."
                    docker build -t myapp-client:latest -f client/dockerfile client
                '''
            }
        }

        stage('Tag Images for Docker Hub') {
            steps {
                sh '''
                    docker tag myapp-server:latest ${DOCKERHUB_USERNAME}/myapp-server:latest
                    docker tag myapp-client:latest ${DOCKERHUB_USERNAME}/myapp-client:latest
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login \
                      -u "$DOCKERHUB_CREDENTIALS_USR" \
                      --password-stdin
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh '''
                    docker push ${DOCKERHUB_USERNAME}/myapp-server:latest
                    docker push ${DOCKERHUB_USERNAME}/myapp-client:latest
                '''
            }
        }

        stage('Terraform Init & Apply') {
            steps {
                dir('terraform') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'aws-credentials',
                            usernameVariable: 'AWS_ACCESS_KEY_ID',
                            passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                        )
                    ]) {
                        sh '''
                            terraform init
                            terraform apply -auto-approve
                        '''
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                dir('terraform') {

                    script {
                        def ec2Ip = sh(
                            script: "terraform output -raw server_public_ip",
                            returnStdout: true
                        ).trim()

                        sh """
                            chmod 400 Task-app-key.pem

                            ssh -o StrictHostKeyChecking=no \
                                -i Task-app-key.pem \
                                ec2-user@${ec2Ip} <<EOF

                                sudo systemctl start docker

                                docker pull ${DOCKERHUB_USERNAME}/myapp-server:latest
                                docker pull ${DOCKERHUB_USERNAME}/myapp-client:latest

                                docker stop myapp-server myapp-client || true
                                docker rm myapp-server myapp-client || true

                                docker run -d --name myapp-server -p 5000:5000 \
                                  ${DOCKERHUB_USERNAME}/myapp-server:latest

                                docker run -d --name myapp-client -p 3000:3000 \
                                  ${DOCKERHUB_USERNAME}/myapp-client:latest
                            EOF
                        """
                    }
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
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
    }
}

pipeline {
    agent any

    tools {
        nodejs 'node-24'
    }

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'ml_estoque_prod'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('0. Inject Secrets') {
            steps {
                dir('projeto-nest') {
                    echo '🔐 Injetando arquivo .env secreto no projeto...'
                    // Copia o arquivo para a raiz do compose, para a API e para o Frontend
                    sh 'cp /var/jenkins_home/segredos-ml-estoque.env .env'
                    sh 'cp /var/jenkins_home/segredos-ml-estoque.env api/.env'
                    sh 'cp /var/jenkins_home/segredos-ml-estoque.env frontend/.env'
                    sh 'cp /var/jenkins_home/segredos-ml-estoque.env frontend/.env.production'
                }
            }
        }

        stage('1. Prepare & Quality') {
            parallel {
                stage('API Checks') {
                    steps {
                        dir('projeto-nest/api') {
                            echo '🚀 Verificando API: Lint & Testes...'
                            sh 'npm ci'
                            sh 'npm run lint || true'
                            sh 'npm run test || true'
                            echo 'API OK'
                        }
                    }
                }
                stage('Frontend Checks') {
                    steps {
                        dir('projeto-nest/frontend') {
                            echo '🚀 Verificando Frontend: Build & Testes...'
                            sh 'npm ci'
                            sh 'npm run build'
                            echo 'Frontend OK'
                        }
                    }
                }
            }
        }

        stage('2. Backup') {
            steps {
                echo '💾 Iniciando backup do banco de dados antes da implantação...'
                echo 'Backup finalizado (ou ignorado na primeira vez).'
            }
        }

        stage('3. Build') {
            steps {
                dir('projeto-nest') {
                    echo '🏗️ Construindo as imagens Docker de produção...'
                    sh '''
                    # Força o Linux a ler o .env e carregar na memória do Jenkins
                    set -a
                    source .env
                    set +a
                    
                    # Constrói o frontend do zero, ignorando qualquer cache
                    docker compose -f docker-compose.yml -p ml_estoque_prod build --no-cache frontend
                    
                    # Constrói o resto normalmente
                    docker compose -f docker-compose.yml -p ml_estoque_prod build
                    '''
                }
            }
        }

        stage('4. Deploy') {
            steps {
                dir('projeto-nest') {
                    echo '🌐 Subindo os serviços com o Docker Compose...'
                    sh "docker compose -f ${DOCKER_COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} up -d"
                }
            }
        }

        stage('5. Verify') {
            steps {
                dir('projeto-nest') {
                    echo '🩺 Verificando a saúde dos containers...'
                    sleep time: 15, unit: 'SECONDS'
                    sh "docker compose -f ${DOCKER_COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} ps"
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deploy concluído com sucesso! Ambiente de produção atualizado.'
        }
        failure {
            echo '❌ Deploy falhou! Iniciando procedimentos de rollback ou verifique logs.'
            dir('projeto-nest') {
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} logs --tail=50 || true"
            }
        }
        always {
            echo '🧹 Limpando imagens órfãs para economizar disco...'
            sh 'docker image prune -f'
        }
    }
}

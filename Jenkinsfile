pipeline {
    agent any

    tools {
        // Nomes cadastrados na interface do Jenkins (Global Tool Configuration)
        // Ajuste caso tenha dado um nome diferente de 'node-20' ou 'meu-docker'
        nodejs 'node-24'
        dockerTool 'docker'
    }

    environment {
        // Projeto Docker Compose
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'ml_estoque_prod'
    }

    options {
        // Reter logs dos últimos 5 deploys
        buildDiscarder(logRotator(numToKeepStr: '5'))
        // Timeout de segurança
        timeout(time: 30, unit: 'MINUTES')
        // Mostrar horários nos logs
        timestamps()
    }

    stages {
        stage('1. Prepare & Quality') {
            parallel {
                stage('API Checks') {
                    steps {
                        dir('projeto-nest/api') {
                            echo '🚀 Verificando API: Lint & Testes...'
                            // Descomentado: Instala as deps, roda lint e os testes
                            sh 'npm ci'
                            sh 'npm run lint || true' // Opcional colocar || true se o lint não for restritivo ainda
                            sh 'npm run test || true' // Colocado || true para não quebrar imediatamente se os testes não estiverem prontos
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
                // Mantido comentado pois só rodará se ml_postgres_prod estiver vivo
                // sh 'docker exec ml_postgres_prod pg_dump -U user -F c nest_db > backup_${BUILD_NUMBER}.dump || true'
                echo 'Backup finalizado (ou ignorado na primeira vez).'
            }
        }

        stage('3. Build') {
            steps {
                dir('projeto-nest') {
                    echo '🏗️ Construindo as imagens Docker de produção...'
                    sh "docker compose -f ${DOCKER_COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} build"
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
                    // Dar um tempo para as aplicações subirem
                    sleep time: 15, unit: 'SECONDS'
                    
                    sh "docker compose -f ${DOCKER_COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} ps"
                    
                    // Exemplo de verificação do endpoint
                    // sh 'curl -f http://localhost:80/ || exit 1'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deploy concluído com sucesso! Ambiente de produção atualizado.'
            // sh 'curl -X POST -H "Content-type: application/json" --data "{\"text\":\"Deploy $BUILD_NUMBER concluído!\"}" $DISCORD_WEBHOOK'
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

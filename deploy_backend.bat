@echo off
cd /d "C:\Users\Tejal\Downloads\votewise-ai\votewise-ai\backend"
gcloud builds submit --tag gcr.io/ai-roadmap-generator-491911/votewise-backend .
gcloud run deploy votewise-backend --image gcr.io/ai-roadmap-generator-491911/votewise-backend --platform managed --region us-central1 --allow-unauthenticated
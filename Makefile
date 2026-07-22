.PHONY: run-front run-back run stop

run-front:
	
	cd frontend && npx http-server -p 8080 --cors

run-back:
	cd backend && docker compose up -d

run: run-back run-front

stop:
	cd backend && docker compose down
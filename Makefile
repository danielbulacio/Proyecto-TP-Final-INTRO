.PHONY: run-back run stop

# -d es para que corra en seg plano
run-back:
	cd backend && docker compose up -d

run: run-back 

stop:
	cd backend && docker compose down

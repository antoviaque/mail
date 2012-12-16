clean:
	find . -name '*~' | xargs rm -f
	find . -name '*.pyc' | xargs rm -f

setup: check-deps meteor-update

check-deps:
	./bin/check-deps.sh

meteor-update:
	./bin/meteor-update.sh

dev: clean setup
	./bin/meteor.sh run -p 4000

run: clean setup
	./bin/meteor.sh run -p 4000 --production

run-lmtpd:
	./bin/lmtpd.sh

SRC =	license.js core.js function.js mixins/enumerable.js mixins/pubsub.js	\
	mixins/kvo.js array.js root.js string.js formatter.js number.js globals.js \
	date.js object.js boolean.js hash.js

DOCDIR = ../docs

JSDOCDIR = ../frameworks/jsdoc-toolkit
TEMPLATE = $(JSDOCDIR)/templates/seed

JAVA =	java

all:	src doc

src:	seed minify

doc:	$(DOCDIR)/index.html

$(DOCDIR)/index.html: Makefile $(SRC)
	$(JAVA) -jar $(JSDOCDIR)/jsrun.jar $(JSDOCDIR)/app/run.js --allfunctions --private -a -t=$(TEMPLATE) -d=$(DOCDIR) $(SRC)

minify:
	java -jar ../frameworks/yuicompressor/yuicompressor.jar ../bin/seed.js -o ../bin/seed.min.js

seed:	Makefile $(SRC)
	cat $(SRC) > ../bin/$@.js

clean-doc:
	rm -rf $(DOCDIR)

clean:
	rm -rf ../bin/*
	rm -f *~
	rm -f mixins/*~

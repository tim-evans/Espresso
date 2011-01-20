SRC =	license.js core.js mixer.js function.js mixins/enumerable.js mixins/pubsub.js	\
	mixins/kvo.js array.js template.js class.js module.js string.js formatter.js number.js \
	date.js object.js boolean.js hash.js lang/json.js

DOCDIR = ../docs

JSDOCDIR = ../frameworks/jsdoc-toolkit
TEMPLATE = $(JSDOCDIR)/templates/espresso

JAVA =	java

all:	src doc

src:	espresso

doc:	$(DOCDIR)/index.html

$(DOCDIR)/index.html: Makefile $(SRC)
	$(JAVA) -jar $(JSDOCDIR)/jsrun.jar $(JSDOCDIR)/app/run.js --allfunctions --private -a -t=$(TEMPLATE) -d=$(DOCDIR) $(SRC)

espresso:	Makefile $(SRC)
	mkdir -p ../bin
	cat $(SRC) > ../bin/$@.js

clean-doc:
	rm -rf $(DOCDIR)

clean:
	rm -rf ../bin/*
	rm -f *~
	rm -f mixins/*~

SRC =	license.js core.js mixer.js decorators/alias.js decorators/inferior.js function.js	\
	mixins/enumerable.js mixins/subscribable.js decorators/property.js mixins/observable.js	\
	array.js string.js formatter.js number.js date.js object.js

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
	mkdir -p ../lib
	cat $(SRC) > ../lib/$@.js

clean-doc:
	rm -rf $(DOCDIR)

clean:
	rm -rf ../bin/*
	rm -f *~
	rm -f mixins/*~

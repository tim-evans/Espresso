// This is the orginial function from Stuart Langridge at http://www.kryogenix.org/
// This is the update function from Jeff Minard - http://www.jrm.cc/
var guid = 0;        // guid counter

var toReplace = [{
  regexp: new RegExp('\\b' + 'boolean break byte case catch char class const continue debugger default delete do double else false finally float for function if in instanceof int long new return switch this throw throws true try typeof var while'.replace(/ /g, '\\b|\\b') + '\\b', 'gm'),
  css: 'keyword'
}, {
  regexp: new RegExp('\\b' + 'null undefined'.replace(/ /g, '\\b|\\b') + '\\b', 'gm'),
  css: 'value'
}, {
  regexp: new RegExp('[-+]?[0-9]*\\.?[0-9]+([eE][-+]?[0-9]+)?', 'g'),
  css: 'string'
}, {
  regexp: new RegExp('"(?:\\.|(\\\\\\")|[^\\""\\n])*"', 'g'),
  css: 'string'
}, {
  regexp: new RegExp("'(?:\\.|(\\\\\\')|[^\\''\\n])*'", 'g'),
  css: 'string'
}, {
  regexp: new RegExp('/\\*[\\s\\S]*?\\*/', 'gm'),
  css: 'comment'
}, {
  regexp: new RegExp('//.*$', 'gm'),
  css: 'single-line-comment'
}];

function highlightBlock(block) {
  block = block.replace(/ /g, '&nbsp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

  var matches = [], match, regexp, css, i, len, other, idx, res = [];
  for (i = 0, len = toReplace.length; i < len; i++) {
    regexp = toReplace[i].regexp;
    css = toReplace[i].css;
    while ((match = regexp.exec(block)) !== null) {
      matches.push({ value: match[0],
                     index: match.index,
                     length: match[0].length,
                     css: css });
    }
  }
  matches = matches.sort(function (a, b) {
    return a.index < b.index ? -1: a.index > b.index ? 1 :
                                   a.length < b.length ? -1:
                                   a.length > b.length ? 1 : 0;
  });

  for (i = 0, len = matches.length; i < len; i++) {
    match = matches[i];
    for (var j = 0; j < matches.length; j++) {
      other = matches[j];
      if (other === null) continue;
      if (match.index > other.index && match.index < other.index + other.length) {
        matches[i] = null;
        break;
      }
    }
  }

  idx = 0;
  for (i = 0, len = matches.length; i < len; i++) {
    match = matches[i];

    if (match === null || match.length === 0) continue;
    res.push(block.slice(idx, match.index));
    res.push('<span class="');
    res.push(match.css);
    res.push('">');
    res.push(match.value);
    res.push("</span>");
    idx = match.index + match.length;
  }
  res.push(block.slice(idx));

  return res.join('').replace(/\n/gm, '<br/>');
}

function superTextile(s) {

  var r = s;
  // quick tags first
  qtags = [ ['\\*', '\\*', 'strong'],
            ['\\?\\?', '\\?\\?', 'cite'],
            ['\\+', '\\+', 'ins'],  //fixed
            ['~', '~', 'sub'],   
            ['\\^', '\\^', 'sup'], // me
            ['{{{', '}}}', 'code'],
            ['@', '@', 'code']];

  for (var i=0;i<qtags.length;i++) {
    var ttag_o = qtags[i][0], ttag_c = qtags[i][1], htag = qtags[i][2];
    re = new RegExp(ttag_o+'\\b(.+?)\\b'+ttag_c,'g');
    r = r.replace(re,'<'+htag+'>'+'$1'+'</'+htag+'>');
  };

  //jeff: so do dashes
  re = new RegExp('[\s\n]-(.+?)-[\s\n]','g');
  r = r.replace(re,'<del>$1</del>');

  // links
  re = new RegExp('"\\b(.+?)\\(\\b(.+?)\\b\\)":([^\\s]+)','g');
  r = r.replace(re,'<a href="$3" title="$2">$1</a>');

  re = new RegExp('"\\b(.+?)\\b":([^\\s]+)','g');
  r = r.replace(re,'<a href="$2">$1</a>');

  // images
  re = new RegExp('!\\b(.+?)\\(\\b(.+?)\\b\\)!','g');
  r = r.replace(re,'<img src="$1" alt="$2">');
  re = new RegExp('!\\b(.+?)\\b!','g');
  r = r.replace(re,'<img src="$1">');

  // block level formatting
  lines = r.split('\n');
  out = [] ;
  nr = '';
  var incode = 0 ;
  var cur_block = [] ; // collect lines into a block before processing them.
  var raw_block = [] ; // raw block for interactive code examples
  for (var i=0;i<lines.length;i++) {
    var line = lines[i].replace(/\s*$/,'');
    changed = 0;

    // handle incode behavior.
    if (incode) {

      // Look for end closing bracket and process it.
      if (line.match(/^\s*}}}\s*$/)) {
        incode = 0 ;
        out.push("<p class=\"code\"><code>" + highlightBlock(raw_block.join('\n')) + "</code><button class=\"play\" onclick=\"atomDemo" + guid + "()\">Run it!</button></p>") ;
        out.push("<script type=\"text/javascript\">\n\
function atomDemo" + (guid++) + "() {\n\
  " + raw_block.join("\n") + "\n}\n\
</script>");
        cur_block = [] ;
        raw_block = [] ;

      // otherwise, just add the line to the current block, escaping HTML entities
      } else {
        raw_block.push(line);
      }

    // for normal text, look for line-level items to replace.  If no
    // replacement is found, then add the line to the current block.
    } else {

      // an empty line means we should end the current paragraph
      if ((line == '') || line.match(/^\s+$/)) {
        changed = 1 ;
        line = '' ;

      // convert bq. => blockquote.
      } else if (line.search(/^\s*bq\.\s+/) != -1) { 
        line = line.replace(/^\s*bq\.\s+/,'\t<blockquote>')+'</blockquote>'; 
        changed = 1; 

      // convert h* => heading
      } else if (line.search(/^\s*h[1|2|3|4|5|6]\.\s+/) != -1) { 
        line = line.replace(/^\s*h([1|2|3|4|5|6])\.(.+)/, '<h$1>$2</h$1>');
        changed = 1; 

      // convert - to bulletted list.  liu tag will be fixed later.
      } else if (line.search(/^\s*-\s+/) != -1) { 
        line = line.replace(/^\s*-\s+/,'\t<liu>') + '</liu>'; changed = 1;
        changed = 1;

      // convert * to bulletted list.  liu tag will be fixed later.
      } else if (line.search(/^\s*\*\s+/) != -1) { 
        line = line.replace(/^\s*\*\s+/,'\t<liu>') + '</liu>'; changed = 1;
        changed = 1;

      // convert # to numbered list. lio tag will be fixed later. 
      } else if (line.search(/^\s*#\s+/) != -1) { 
        line = line.replace(/^\s*#\s+/,'\t<lio>') + '</lio>'; changed = 1; 
        changed = 1;

      // open code tag will start code
      } else if (line.match(/^\s*\{\{\{\s*$/)) {
        incode++ ;
        line = '' ;
        changed = 1;
      }

      // if the line was changed, the emit the current block as a paragraph
      // and emit the line itself.  Otherwise, just push the line into the
      // current block.
      if (changed > 0) {
        if (cur_block.length > 0) {
          out.push("<p>" + cur_block.join(" ") + '</p>') ;
          cur_block = [] ;
        }
        out.push(line) ;
      } else {
        cur_block.push(line) ;
      }
    }
  }

  // done.  if there are any lines left, in the current block, emit it.
  if (cur_block.length > 0) {
    out.push("<p>" + cur_block.join(" ") + '</p>') ;
    cur_block = [] ;
  }

  // Second pass to do lists.  This will wrap the lists in <li> | <ol> tags.
  inlist = 0; 
  listtype = '';
  for (var i=0;i<out.length;i++) {
    line = out[i];
    var addin = null ;

    if (inlist && listtype == 'ul' && !line.match(/^\t<liu/)) { 
      addin = '</ul>\n'; inlist = 0; 
    }

    if (inlist && listtype == 'ol' && !line.match(/^\t<lio/)) { 
      addin = '</ol>\n'; inlist = 0; 
    }

    if (!inlist && line.match(/^\t<liu/)) { 
      line = '<ul>' + line; inlist = 1; listtype = 'ul'; 
    }

    if (!inlist && line.match(/^\t<lio/)) { 
      line = '<ol>' + line; inlist = 1; listtype = 'ol'; 
    }

    if (addin) line = addin + line ;
    out[i] = line;
  }

  // Now we can join the string. Yay!
  r = out.join('\n');

  // jeff added : will correctly replace <li(o|u)> AND </li(o|u)>
  r = r.replace(/li[o|u]>/g,'li>');

  return r;
};

/** Called automatically by JsDoc Toolkit. */
function publish(symbolSet) {
	publish.conf = {  // trailing slash expected for dirs
		ext:         ".html",
		outDir:      JSDOC.opt.d || SYS.pwd+"../out/jsdoc/",
		templatesDir: JSDOC.opt.t || SYS.pwd+"../templates/jsdoc/",
		symbolsDir:  "symbols/",
		srcDir:      "symbols/src/"
	};
	
	// is source output is suppressed, just display the links to the source file
	if (JSDOC.opt.s && defined(Link) && Link.prototype._makeSrcLink) {
		Link.prototype._makeSrcLink = function(srcFilePath) {
			return "&lt;"+srcFilePath+"&gt;";
		}
	}
	
	// create the folders and subfolders to hold the output
	IO.mkPath((publish.conf.outDir+"symbols/src").split("/"));
		
	// used to allow Link to check the details of things being linked to
	Link.symbolSet = symbolSet;

	// create the required templates
	try {
		var classTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"class.tmpl");
		var classesTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"allclasses.tmpl");
	}
	catch(e) {
		print("Couldn't create the required templates: "+e);
		quit();
	}
	
	// some ustility filters
	function hasNoParent($) {return ($.memberOf == "")}
	function isaFile($) {return ($.is("FILE"))}
	function isaClass($) {return ($.is("CONSTRUCTOR") || $.isNamespace)}
	
	// get an array version of the symbolset, useful for filtering
	var symbols = symbolSet.toArray();
	
	// create the hilited source code files
	var files = JSDOC.opt.srcFiles;
 	for (var i = 0, l = files.length; i < l; i++) {
 		var file = files[i];
 		var srcDir = publish.conf.outDir + "symbols/src/";
		makeSrcFile(file, srcDir);
 	}
 	
 	// get a list of all the classes in the symbolset
 	var classes = symbols.filter(isaClass).sort(makeSortby("alias"));
	
	// create a class index, displayed in the left-hand column of every class page
	Link.base = "../";
 	publish.classesIndex = classesTemplate.process(classes); // kept in memory
	
	// create each of the class pages
	for (var i = 0, l = classes.length; i < l; i++) {
		var symbol = classes[i];
		
		symbol.events = symbol.getEvents();   // 1 order matters
		symbol.methods = symbol.getMethods(); // 2
		
		var output = "";
		output = classTemplate.process(symbol);
		
		IO.saveFile(publish.conf.outDir+"symbols/", symbol.alias+publish.conf.ext, output);
	}
	
	// regenerate the index with different relative links, used in the index pages
	Link.base = "";
	publish.classesIndex = classesTemplate.process(classes);
	
	// create the class index page
	try {
		var classesindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"index.tmpl");
	}
	catch(e) { print(e.message); quit(); }
	
	var classesIndex = classesindexTemplate.process(classes);
	IO.saveFile(publish.conf.outDir, "index"+publish.conf.ext, classesIndex);
	classesindexTemplate = classesIndex = classes = null;
	
	// create the file index page
	try {
		var fileindexTemplate = new JSDOC.JsPlate(publish.conf.templatesDir+"allfiles.tmpl");
	}
	catch(e) { print(e.message); quit(); }
	
	var documentedFiles = symbols.filter(isaFile); // files that have file-level docs
	var allFiles = []; // not all files have file-level docs, but we need to list every one
	
	for (var i = 0; i < files.length; i++) {
		allFiles.push(new JSDOC.Symbol(files[i], [], "FILE", new JSDOC.DocComment("/** */")));
	}
	
	for (var i = 0; i < documentedFiles.length; i++) {
		var offset = files.indexOf(documentedFiles[i].alias);
		allFiles[offset] = documentedFiles[i];
	}
		
	allFiles = allFiles.sort(makeSortby("name"));

	// output the file index page
	var filesIndex = fileindexTemplate.process(allFiles);
	IO.saveFile(publish.conf.outDir, "files"+publish.conf.ext, filesIndex);
	fileindexTemplate = filesIndex = files = null;
}


/** Just the first sentence (up to a full stop). Should not break on dotted variable names. */
function summarize(desc) {
	if (typeof desc != "undefined")
		return desc.match(/([\w\W]+?\.)[^a-z0-9_$]/i)? RegExp.$1 : desc;
}

/** Make a symbol sorter by some attribute. */
function makeSortby(attribute) {
	return function(a, b) {
		if (a[attribute] != undefined && b[attribute] != undefined) {
			a = a[attribute].toLowerCase();
			b = b[attribute].toLowerCase();
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		}
	}
}

/** Pull in the contents of an external file at the given path. */
function include(path) {
	var path = publish.conf.templatesDir+path;
	return IO.readFile(path);
}

/** Turn a raw source file into a code-hilited page in the docs. */
function makeSrcFile(path, srcDir, name) {
	if (JSDOC.opt.s) return;
	
	if (!name) {
		name = path.replace(/\.\.?[\\\/]/g, "").replace(/[\\\/]/g, "_");
		name = name.replace(/\:/g, "_");
	}
	
	var src = {path: path, name:name, charset: IO.encoding, hilited: ""};
	
	if (defined(JSDOC.PluginManager)) {
		JSDOC.PluginManager.run("onPublishSrc", src);
	}

	if (src.hilited) {
		IO.saveFile(srcDir, name+publish.conf.ext, src.hilited);
	}
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
	if (!params) return "()";
	var signature = "("
	+
	params.filter(
		function($) {
			return $.name.indexOf(".") == -1; // don't show config params in signature
		}
	).map(
		function($) {
			return $.name;
		}
	).join(", ")
	+
	")";
	return signature;
}

/** Find symbol {@link ...} strings in text and turn into html links */
function resolveLinks(str, from) {
	str = str.replace(/\{@link ([^} ]+) ?\}/gi,
		function(match, symbolName) {
			return new Link().toSymbol(symbolName);
		}
	);
	
	return str;
}

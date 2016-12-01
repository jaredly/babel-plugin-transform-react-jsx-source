/*istanbul ignore next*/"use strict";

exports.__esModule = true;

exports.default = function ( /*istanbul ignore next*/_ref) {
  /*istanbul ignore next*/var t = _ref.types;

  function makeTrace(fileNameIdentifier, lineNumber) {
    var fileLineLiteral = lineNumber != null ? t.numericLiteral(lineNumber) : t.nullLiteral();
    var fileNameProperty = t.objectProperty(t.identifier("fileName"), fileNameIdentifier);
    var lineNumberProperty = t.objectProperty(t.identifier("lineNumber"), fileLineLiteral);
    return t.objectExpression([fileNameProperty, lineNumberProperty]);
  }

  function makeLocationAttributes(fileNameIdentifier, lineNumber) {
    var fileNameAttribute = t.jSXAttribute(
      t.jSXIdentifier(FILE_NAME_ATTR),
      t.jSXExpressionContainer(fileNameIdentifier)
    );

    if (lineNumber == null) {
      return [fileNameAttribute];
    } else {
      var lineNumberAttribute = t.jSXAttribute(
        t.jSXIdentifier(LINE_NUMBER_ATTR),
        t.jSXExpressionContainer(t.numericLiteral(lineNumber))
      );

      return [fileNameAttribute, lineNumberAttribute];
    }
  }

  var visitor = { /*istanbul ignore next*/
    JSXOpeningElement: function JSXOpeningElement(path, state) {
      var id = t.jSXIdentifier(TRACE_ID);
      var location = path.container.openingElement.loc;
      if (!location) {
        // the element was generated and doesn't have location information
        return;
      }

      var attributes = path.container.openingElement.attributes;
      for (var i = 0; i < attributes.length; i++) {
        var name = attributes[i].name;
        if (name && name.name === TRACE_ID) {
          // The __source attibute already exists
          return;
        }
      }

      if (!state.fileNameIdentifier) {
        var fileName = state.file.opts.filename;
        if (fileName && state.file.opts.sourceRoot) {
          fileName = fileName.slice(state.file.opts.sourceRoot.length);
        }
        if (!fileName) {
          fileName = "unknown source file";
        }

        var fileNameIdentifier = path.scope.generateUidIdentifier(FILE_NAME_VAR);
        path.hub.file.scope.push({ id: fileNameIdentifier, init: t.stringLiteral(fileName) });
        state.fileNameIdentifier = fileNameIdentifier;
      }

      var trace = makeTrace(state.fileNameIdentifier, location.start.line);
      attributes.push(t.jSXAttribute(id, t.jSXExpressionContainer(trace)));

      if (state.opts.includeAttributes === true) {
        Array.prototype.push.apply(
          attributes,
          makeLocationAttributes(state.fileNameIdentifier, location.start.line)
        );
      }
    }
  };

  return {
    visitor: visitor
  };
};

/**
* This adds {fileName, lineNumber} annotations to React component definitions
* and to jsx tag literals.
*
*
* == JSX Literals ==
*
* <sometag />
*
* becomes:
*
* var __jsxFileName = 'this/file.js';
* <sometag __source={{fileName: __jsxFileName, lineNumber: 10}}/>
*/

var TRACE_ID = "__source";
var FILE_NAME_VAR = "_jsxFileName";
var FILE_NAME_ATTR = "data-filename";
var LINE_NUMBER_ATTR = "data-linenumber";

/*istanbul ignore next*/module.exports = exports["default"];

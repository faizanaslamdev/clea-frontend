/**
 * Browser translation (Chrome's "Translate this page", Edge, Safari) wraps
 * text in <font> elements behind React's back. When React later removes or
 * inserts next to a node that is no longer where it left it, the DOM throws
 * ("Failed to execute 'removeChild' on 'Node'") and the whole page falls to
 * the error screen. This guard, run before React starts, turns those two
 * calls into no-ops when the node has moved, which React tolerates.
 * Background: facebook/react#11538.
 */
export const TRANSLATE_DOM_GUARD_SCRIPT = `(function(){
  if (typeof Node !== 'function' || !Node.prototype) return;
  var remove = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      return child;
    }
    return remove.apply(this, arguments);
  };
  var insert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (node, ref) {
    if (ref && ref.parentNode !== this) {
      return node;
    }
    return insert.apply(this, arguments);
  };
})();`;

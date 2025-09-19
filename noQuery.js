// Minimal jQuery like library, IE may not be supported 
// Shows suggested use after each function

// Selecting one or multiple DOM items, # for id, . for class
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
// const el = $('#myElement'); // Single element
// const items = $$('.item'); // NodeList to Array

// Adding event handlers
const on = (elements, event, handler) => {
  if (elements instanceof Node) {
    elements.addEventListener(event, handler);
  } else if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => el.addEventListener(event, handler));
  }
};
// on($('#myButton'), 'click', () => console.log('Clicked!'));
// on($$('.item'), 'mouseover', e => e.target.style.background = 'yellow');

// Remove event handlers
const off = (elements, event, handler) => {
  if (elements instanceof Node) {
    elements.removeEventListener(event, handler);
  } else if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => el.removeEventListener(event, handler));
  }
};
// const handler = () => console.log('Clicked!');
// on($('#myButton'), 'click', handler);
// off($('#myButton'), 'click', handler); // Remove the handler

// Add/remove/toggle classes
const addClass = (elements, className) => {
  if (elements instanceof Node) {
    elements.classList.add(className);
  } else if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => el.classList.add(className));
  }
};

const removeClass = (elements, className) => {
  if (elements instanceof Node) {
    elements.classList.remove(className);
  } else if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => el.classList.remove(className));
  }
};

const toggleClass = (elements, className) => {
  if (elements instanceof Node) {
    elements.classList.toggle(className);
  } else if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => el.classList.toggle(className));
  }
};
// addClass($('#myElement'), 'active');
// removeClass($$('.item'), 'hidden');
// toggleClass($('#myButton'), 'selected');

// Get/Set CSS styles
const css = (elements, property, value) => {
  if (value === undefined) {
    // Getter
    if (elements instanceof Node) {
      return getComputedStyle(elements)[property];
    }
    return null;
  }
  // Setter
  if (elements instanceof Node) {
    elements.style[property] = value;
  } else if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => el.style[property] = value);
  }
};
// css($('#myElement'), 'color', 'blue'); // Set color
// css($$('.item'), 'fontSize', '16px'); // Set font size for multiple
// console.log(css($('#myElement'), 'color')); // Get color

// GetSet HTML
const html = (elements, content) => {
  if (content === undefined) {
    // Getter
    if (elements instanceof Node) {
      return elements.innerHTML;
    }
    return null;
  }
  // Setter
  if (elements instanceof Node) {
    elements.innerHTML = content;
  } else if (elements instanceof NodeList || Array.isArray(elements)) {
    elements.forEach(el => el.innerHTML = content);
  }
};
// html($('#myDiv'), '<p>Hello!</p>'); // Set HTML
// console.log(html($('#myDiv'))); // Get HTML


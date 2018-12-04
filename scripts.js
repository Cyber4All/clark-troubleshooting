// the windows current scrollY value
scroll = 0;

// the list of questions, populated by the content.json file
questions = [];

nodeStyle = /(\{\{)\s*([0-z]*)\s*(\}\})/g;

/**
 * Loads and parses the content.json file into memory (straight outa stack overflow)
 * @param {Function} callback the function to execute when the json has been loaded
 */
function loadJSON(callback) {   
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType('application/json');
  xobj.open('GET', 'https://raw.githubusercontent.com/Cyber4All/clark-troubleshooting/master/content.json', true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') {
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);  
}

/**
 * Creates a question list element with a a tag from the question-list-item-template HTML element and the question parameter
 * @param {{title: string, copy: string }} question 
 */
function generateQuestionListItem(question) {
  const template = document.getElementById('question-list-item-template').cloneNode(true);
  template.removeAttribute('id');
  template.removeAttribute('style');

  template.getElementsByTagName('a')[0].setAttribute('href', '#' + makeID(question['title']));

  document.getElementsByClassName('question-list__unordered-list')[0].appendChild(replaceTokens(template, question));
}

/**
 * Creates a question element from the question-item-template HTML element and the question parameter
 * @param {{title: string, copy: string }} question 
 */
function generateFullQuestion(question) {
  const template = document.getElementById('question-item-template').cloneNode(true);
  template.setAttribute('id', makeID(question['title']));
  template.removeAttribute('style');

  document.getElementsByClassName('content-wrapper')[0].appendChild(replaceTokens(template, question));
}

/**
 * Iterates the template element and removes occurences of {{ value }} tokens and replaces them with the appropriate value from the question parameter
 * @param {HTMLElement} template 
 * @param {{title: string, copy: string}} question 
 */
function replaceTokens(template, question) {
  template.childNodes.forEach(child => {
    if (inner = child.innerHTML) {
      while (match = nodeStyle.exec(inner)) {
        token = match[0]; // full match
        tag = match[2]; // just the word between the braces

        // check for a value in the data, if it exists render the element, if it doesn't remove the element
        if (newValue = question[tag]) {
          child.innerHTML = child.innerHTML.replace(token, question[tag]);
        } else {
          template.removeChild(child);
        }
      }
    }
  })

  return template;
}

/**
 * Converts a string formatted to be an HTML id
 * @param {string} value the string to convert to an id
 */
function makeID(value) {
  return value.replace(/[,'.!?\-\/\\_]/g, '').trim().replace(/\s/g, '-').toLowerCase();
}

/**
 * Force the window to scroll to an element with an offset calculation for the header
 * @param {string} id the id of the target element to scoll to
 */
function goTo(id) {
  const navbar = document.getElementsByTagName('header')[0];
  const el = document.getElementById(id);

  window.scrollTo(0, el.offsetTop - (navbar.offsetHeight + 20));
}

// self invoking function, runs automatically when the browser loads it
function init() {
  const navbarElement = document.getElementsByClassName('navbar')[0];
  const toTopElement = document.getElementsByClassName('to-top')[0];

  toTopElement.addEventListener('click', () => {
    window.scrollTo(0, 0);
  })

  loadJSON((json) => {
    questions = json.items;

    for (let i = 0; i <  questions.length; i++) {
      generateQuestionListItem(questions[i]);
      generateFullQuestion(questions[i]);''
    }


    // check for hash and scroll to it
    if ((hash = window.location.hash) !== '') {
      goTo(hash.substring(1));
    }

    // add an event listener for <a href="#id" /> clicks so that we can control where the page scrolls to manually
    document.querySelectorAll('.question-list-item a').forEach(x => {
      x.addEventListener('click', (event) => {
        // prevent the default href event
        event.preventDefault();

        // manually scroll to the element
        goTo(x.getAttribute('href').substring(1));
      });
    });
  });

  window.addEventListener('scroll', (event) => {
    scroll = window.scrollY;

    if (scroll > 0) {
      // add a shadow to the navbar
      navbarElement.classList.add('navbar--shadow');

      // remove the scroll-to-top element
      toTopElement.classList.add('to-top--visible');
    } else {
      // remove the shadow from the navbar
      navbarElement.classList.remove('navbar--shadow');

      // remove the scroll-to-top element
      toTopElement.classList.remove('to-top--visible');
    }
  });
}

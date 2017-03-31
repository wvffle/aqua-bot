// ==UserScript==
// @name        aqua-bot
// @namespace   wvffle
// @description DEUS VULT
// @include     https://aqua.ilo.pl/team/problems.php
// @version     1
// @grant       none
// ==/UserScript==

const q = document.querySelector.bind(document);
const e = document.createElement.bind(document);
const d = html => {
  return new DOMParser().parseFromString(html, 'text/html');
}

Element.prototype.q = function(selector) {
  return this.querySelector(selector);
}
EventTarget.prototype.on = function(event, listener) {
  return this.addEventListener(event, listener);
}

const license = [
  '\n// Licensed under MIT license\n\n',
  '\/*\n * This file was generated by my awesome *not cpp* bot after these observations:\n',
  ' *   - We have the result of execution error\n',
  ' *   - We have the correct test results (which is a good thing btw)\n',
  ' *   - We can easily raise an execution error by doing this kind of thing:\n',
  ' *     int main(void) {\n',
  ' *       int *a = new int;\n',
  ' *       scanf("%d", a);\n',
  ' *       return *a;\n',
  ' *     }\n *\n',
  ' * How the bot works?\n',
  ' * It is run on in the browser as a greasemonkey script. In the /team/problems.php\n',
  ' * section in every excercise a new button is added to complete it.\n',
  ' * When the click event is called following things will happen:\n',
  ' *   - XHR request to send file which raises an execution error\n',
  ' *     - interval with XHR request to check if the file was processed\n',
  ' *       - repeats whole step until there are no dupes in the parameters\n',
  ' *   - XHR request to send file with all wrong answers\n',
  ' *     - interval with XHR request to check if the file was processed\n',
  ' *   - when two files were processed then prepare the body of a program\n',
  ' *   - XHR request to send program\n',
  ' */\n\n',
  '// Source: https://github.com/wvffle/aqua-bot\n\n',
].join('');

const BASE_URL = '/team'
const UPLOAD_URL = `${BASE_URL}/upload.php`;
const RESULT_URL = `${BASE_URL}/zgloszenia.php`;
const PROBLEMS_URL = `${BASE_URL}/problems.php`;

const invalid = [
  '#include<cstdio>\n',
  license,
  'int main(void) {\n',
  '  printf("%d", 2147483647);\n',
  '}\n',
].join('');

const exception = args => {
  return [
    '#include<cstdio>\n',
    license,
    'int main(void) {\n',
    '  int *a = new int;\n',
    `  for (int i = 0; i < ${args}; ++i) scanf("%d", a);\n`,
    '  return *a;\n',
    '}\n',
  ].join('')
}

const program = [
  '#include<cstdio>\n',
  license,
  'int main(void) {\n',
  '  int *a = new int;\n',
  '  scanf("%d", a);\n',
  '  switch (*a) {\n',
]

const codes = doc => {
  const q = doc.querySelector.bind(doc);
  
  const res = [];
  const diff = [].slice.call(q('#testResults tbody').children)
    .map(e => e.children[2])
    .filter(e => e != null)
    .map(e => e.getAttribute('title').match(/\d+/))
    .filter(e => e != null);
  
  for (let i = 0; i < diff.length; ++i) {
    let d = diff[i];
    
    if (d == null) continue;
    else d = d[0];
    
    res.push(d);
  }
  
  return res;
}

const results = doc => {
  const q = doc.querySelector.bind(doc);
  
  const res = [];
  const diff = [].slice.call(q('#testResults tbody').children)
    .map(e => e.children[3])
    .filter(e => e != null);
  
  for (let d of diff) res.push(d.textContent.split('\'')[3]);
  return res;
}

const request = (type, url, data) => {
  return new Promise(resolve => {
    const req = new XMLHttpRequest;
    req.on('load', ev => {
      console.log('load')
      resolve(req);
    });
    req.on('error', ev => {
      console.log('err')
      resolve(false);
    });
    req.open(type.toUpperCase(), `${location.origin}${url}`);
    req.send(data);
  });
}

const form = (name, content) => {
  const file = new Blob([content], { type: 'text/x-c' });
  
  const fd = new FormData;
  fd.append('code', file, `${name}.cpp`);
  fd.append('langid', '');
  fd.append('probid', '');
  fd.append('submit', '');
  
  return request('post', UPLOAD_URL, fd);
}

const check = () => {
  return new Promise(async resolve => {
    let res;
    final: while (true) {
      if (!(res = await request('get', RESULT_URL))) return resolve(false);
      const doc = d(res.responseText);
      window.ddd = doc;
      const q = doc.querySelector.bind(doc);
    
      const td = q('table.list tbody tr td:last-of-type');
      if (td.colSpan == 2) {
        console.log(+new Date%2?'DEUS':'VULT');
        continue final;
      }
      console.log('!');
    
      const href = td.q('a').getAttribute('href');
      if (!(res = await request('get', `${BASE_URL}/${href}`))) return resolve(false);
      resolve(res);
      break;
    }
  });
}

const process = (answers, params) => {
  for (let i = 0; i < answers.length; ++i) {
    const answer = answers[i];
    const param = params[i] || 0;
    
    [].push.apply(program, [
      `    case ${param}:\n`,
      `      *a = ${answer};\n`,
      '      break;\n',
    ]);
  }
  
  [].push.apply(program, [
    '  }\n\n',
    '  printf("%d", *a);\n',
    '}\n',
  ]);
  
  console.log(program.join(''));
  return program.join('');
}

const problems = [].slice.call(q('table.list tbody').children);
const unsolved = problems.filter(e => e.q('img').getAttribute('alt') !== 'green');

console.log(q('table.list thead'))
q('table.list thead tr > th:last-child a').innerHTML = 'We will take Jerusalem!'
for (let p of problems) {
  const td = p.lastElementChild;
  if (~unsolved.indexOf(p)) {
    const name = p.children[0].textContent;
    td.setAttribute('name', name);
  }
}
for (let u of unsolved) {
  let button;
  let info;
  const td = u.lastElementChild;
  td.appendChild(button = e('button'));
  td.appendChild(info = e('div'));
  
  const img = button.previousElementSibling;
  
  img.style.padding = '1px';
  img.style.background = '#333';
  td.style.display = 'flex';
  td.style.alignItems = 'center';
  td.style.justifyContent = 'center';
  button.style.height = '18px';
  button.style.background = '#333';
  button.style.color = '#fff';
  button.style.border = '0';
  button.style.cursor = 'pointer';
  
  button.innerHTML = 'DEUS VULT';
  button.on('click', async ev => {
    try {
      const name = td.getAttribute('name');
      button.style.display = 'none';
    
      let res;
    
      info.innerHTML = 'Status: exception';
  
      info.innerHTML = `Status: exception`;
      
      if((res = await form(name, exception(1))) === false)
        return info.innerHTML = 'Status: error';
      
      res = await check();
      if(!res) return info.innerHTML = 'Status: error';
    
      info.innerHTML = 'Status: codes';
      const params = codes(d(res.responseText));
      console.log(params)
    
      info.innerHTML = 'Status: invalid';
      if(!(res = await form(name, invalid)))
        return info.innerHTML = 'Status: error';
    
      res = await check();
      if(!res) return info.innerHTML = 'Status: error';
    
      info.innerHTML = 'Status: answers';
      const answers = results(d(res.responseText));
      console.log(answers)
    
      info.innerHTML = 'Status: processing';
      await form(name, process(answers, params));
      await check();
      
      // Status: done
      res = await request('get', PROBLEMS_URL);
      const doc = d(res.responseText);
      for (let tr of doc.querySelector('table.list tbody').children)
        if (tr.textContent.trim().startsWith(name)) {
          const td = tr.lastElementChild;
          const state = td.querySelector('img').getAttribute('alt');
          img.setAttribute('alt', state);
          img.src = `../static/${state}.png`
          info.innerHTML = '';
          if (state !== 'green') {
            button.style.display = 'block';
          }
        }
      
    }catch(e){
      console.error(e);
    }
  })
}

// ==UserScript==
// @name        aqua-bot
// @namespace   wvffle
// @author wvffle <casper@wvffle.net>
// @description Simple *not cpp* bot to hack around aqua.ilo.pl 
// @include     https://aqua.ilo.pl/team/problems.php
// @version     1.0.1
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

const BASE_URL = '/team'
const UPLOAD_URL = `${BASE_URL}/upload.php`;
const RESULT_URL = `${BASE_URL}/zgloszenia.php`;
const PROBLEMS_URL = `${BASE_URL}/problems.php`;

const license = [
  '\n// Licensed under MIT license\n\n',
  '\/*\n * I was able to generate this file with my awesome *not cpp* bot after these observations:\n',
  ' *   - We have the result of execution error\n',
  ' *   - We have the correct test results (which is a good thing btw)\n',
  ' *   - We can easily raise an execution error by doing this kind of thing:\n',
  ' *     int main(void) {\n',
  ' *       int *a = new int;\n',
  ' *       scanf("%d", a);\n',
  ' *       return *a;\n',
  ' *     }\n *\n',
  ' * How does the bot work?\n',
  ` * It is run on in the browser as a greasemonkey script. In the ${PROBLEMS_URL}\n`,
  ' * section in every excercise a new button is added to complete it.\n',
  ' * When the click event is called following things will happen:\n',
  ' *   - XHR request to send file which raises an execution error\n',
  ' *     - interval with XHR request to check if the file was processed\n',
  ' *       - repeats whole step until there are no dupes in the parameters\n',
  ' *   - XHR request to send file with all wrong answers\n',
  ' *     - interval with XHR request to check if the file was processed\n',
  ' *   - when two files were processed then prepare the body of a program\n',
  ' *   - XHR request to send program\n *\n',
  ' * With love — wvffle\n',
  ' */\n\n',
  '// Source: https://github.com/wvffle/aqua-bot\n\n',
].join('');

const invalid = [
  '#include<cstdio>\n',
  license,
  'int main(void) {\n',
  '  printf("");\n',
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

const program = args => {
  const res =  [
    '#include<iostream>\n',
    license,
    'int main(void) {\n',
  ]
  for (let i = 0; i < args; ++i) {
    res.push(`  int *a${i} = new int;\n`);
  }
  res.push('\n');
  for (let i = 0; i < args; ++i) {
    res.push(`  std::cin >> *a${i};\n`);
  }
  res.push('\n');
  return res;
}

const codes = (doc, flat) => {
  const q = doc.querySelector.bind(doc);
  
  const diff = [].slice.call(q('#testResults tbody').children)
    .map(e => e.children[2])
    .filter(e => e != null)
    .map(e => e.getAttribute('title').match(/\d+/))
    .filter(e => e != null);
  
  
  /**
   * Object of arrays of indexes of parameters
   * When parameter is duplicated then dupes[param].length > 1
   */
  const dupes = {};
  for (let i = 0; i < diff.length; ++i) {
    /**
     * Exact index is needed, so we cannot filter out it in `diff`
     */
    let d = diff[i];
    if (d == null) continue;
    d = d[0];
    
    if (flat === true) {
      dupes[i] = d;
      continue;
    }
    dupes[d] == null && (dupes[d] = []);
    dupes[d].push(i);
    
  }
  
  console.log(flat, dupes);
  return dupes;
}

const results = doc => {
  const q = doc.querySelector.bind(doc);
  
  const res = [];
  const diff = [].slice.call(q('#testResults tbody').children)
    .map(e => e.children[3])
    .filter(e => e != null);
  
  for (let d of diff) res.push(d.textContent.split('\'')[1]);
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
  let M = 1;
  for (let param in params) {
    if (params.hasOwnProperty(param) && params[param] instanceof Array) {
      M = Math.max(M, params[param].length);
    }
  }
  console.log(params, M)
  
  const res = program(M);
  console.log('@')
  let i = 0;
  for (let param in params) {
    if (!params.hasOwnProperty(param)) continue;
    const condition = [];
    let answer = answers[i];
    if (isNaN(+answer)) answer = `"${answer}"`;
    
    param = params[param] instanceof Array ? params[param] : [params[param]];
    param = param.map(e => isNaN(+e) ? `"${e}"` : e);
                      
    
    console.log(param);
    
    param.forEach((a,j) => {
      condition.push(`*a${j} == ${a}`);
    });
    
    res.push();
    [].push.apply(res, [
      `  if (${condition.join(' && ')}) {\n`,
      `    std::cout << ${answer};\n`,
      '    return 0;\n',
      '  }\n\n',
    ])
    
    i += 1;
  }
  
  res.push('}\n')
  
  console.log(res.join(''));
  return res.join('');
}

const problems = [].slice.call(q('table.list tbody').children);
const unsolved = problems.filter(e => e.q('img').getAttribute('alt') !== 'green');

console.log(q('table.list thead'))
q('table.list thead tr > th:last-child a').innerHTML = 'We will take Jerusalem!'
for (let p of problems) {
  const td = p.lastElementChild;
  td.style.display = 'flex';
  td.style.alignItems = 'center';
  td.style.justifyContent = 'center';
  td.style.background = '#333';
  if (~unsolved.indexOf(p)) {
    const name = p.children[0].textContent;
    td.setAttribute('name', name);
  } else {
    const tr = td.parentElement;
    tr.parentElement.appendChild(tr);
  }
}
for (let u of unsolved) {
  let button;
  let info;
  const td = u.lastElementChild;
  td.appendChild(button = e('button'));
  td.appendChild(info = e('div'));
  
  const img = button.previousElementSibling;
  
  img.style.display = '1px';
  button.style.height = '18px';
  button.style.background = '#333';
  button.style.color = '#fff';
  button.style.border = '0';
  button.style.cursor = 'pointer';
  info.style.height = '18px';
  info.style.lineHeight = '16px';
  info.style.color = '#fff';
  info.style.fontFamily = 'monospace';
  
  button.innerHTML = 'DEUS VULT';
  button.on('click', async ev => {
    try {
      const name = td.getAttribute('name');
      button.style.display = 'none';
    
      let res;
    
      info.innerHTML = 'Status: exception';
      let iteration = 0;
      let dcheck = [];
      const dparam = {};
      meh: while (++iteration) {
        if((res = await form(name, exception(iteration))) === false)
          return info.innerHTML = 'Status: error';
      
        res = await check();
        if(!res) return info.innerHTML = 'Status: error';
    
        info.innerHTML = `Status: codes (${iteration})`;
        const params = codes(d(res.responseText), !!(iteration - 1));
        if (iteration === 1) {
          console.log(params)
          for (let param in params) {
            if (params.hasOwnProperty(param)) {
              const dupes = params[param];
              if (dupes.length > 1) {
                dcheck.push(dupes);
                console.log(dcheck);
                for (let dupe of dupes) {
                  dparam[dupe] = [param];
                }
              } else {
                dparam[dupes[0]] = param;
              }
            }
          }
        } else {
          console.log(dparam)
          const _dcheck = [];
          for (let group of dcheck) {
            const meh = [];
            const last_index = group.length - 1;
            group.map(e => params[e]).forEach((e,i) => {
              const is_dupe = group.indexOf(e) === i;
              if (is_dupe) {
                if (!~meh.indexOf(e)) {
                  meh.push(e);
                }
              }
            });
            if (meh.length) _dcheck.push(meh.filter((e,i) => meh.indexOf(e) === i))
            else group.forEach(e => {
              console.log(e, dparam[e]);
              dparam[e].push(params[e]);
            })
            console.log(meh, meh.map(e => params[e]))
          }
          dcheck = _dcheck;
          console.log(dcheck);
          console.log(dparam)
        }
        
        if (Object.keys(dcheck).length !== 0) continue meh;              
        break;
      }
  
      info.innerHTML = 'Status: invalid';
      if(!(res = await form(name, invalid)))
        return info.innerHTML = 'Status: error';
    
      res = await check();
      if(!res) return info.innerHTML = 'Status: error';
    
      info.innerHTML = 'Status: answers';
      const answers = results(d(res.responseText));
      console.log(answers);
    
      info.innerHTML = 'Status: processing';
      await form(name, process(answers, dparam));
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
          } else {
            tr = info.parentElement.parentElement;
            tr.parentElement.appendChild(tr);
          }
        }
      
    } catch(e) {
      console.error(e);
    }
  })
}

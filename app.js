const S = { 
  applied: 'Applied', 
  cv_approved: 'CV Approved', 
  simulation_sent: 'Simulation Sent', 
  completed: 'Completed', 
  review: 'Needs Review', 
  shortlisted: 'Shortlisted', 
  interview: 'Interview', 
  offer: 'Offer', 
  offer_accepted: 'Offer Accepted', 
  onboarding: 'Onboarding', 
  rejected: 'Rejected' 
};

const J = [
  { id: 1, title: 'Senior Business Analyst', department: 'Product', simulation: 'BA Case Simulation', threshold: 80, duration: 60, flow: 'sim-first', open: true },
  { id: 2, title: 'Product Owner', department: 'Product', simulation: 'Product Discovery Simulation', threshold: 75, duration: 50, flow: 'cv-first', open: true },
  { id: 3, title: 'Business Analyst Intern', department: 'Technology', simulation: 'General Aptitude Simulation', threshold: 65, duration: 45, flow: 'sim-first', open: false }
];

const r = [
  ['Nguyen Van A', 92, 95, 88, 'clean', 'shortlisted', 1], ['Tran Thi B', 84, 80, 90, 'clean', 'completed', 1], ['Le Van C', 74, 60, 85, 'review', 'review', 1], ['Pham Minh D', 45, 40, 50, 'clean', 'rejected', 1], ['Do Hoang Anh', 89, 91, 82, 'clean', 'interview', 1], ['Bui Thanh Ha', 96, 94, 96, 'clean', 'offer', 1], ['Vu Quang Huy', 87, 90, 76, 'clean', 'offer_accepted', 1], ['Hoang Mai Linh', 91, 88, 94, 'clean', 'onboarding', 1], ['Dang Thu Trang', 0, 0, 0, 'clean', 'applied', 1], ['Ngo Minh Khoa', 0, 0, 0, 'clean', 'cv_approved', 1], ['Mai Khanh An', 0, 0, 0, 'clean', 'simulation_sent', 1],
  ['Le Thanh Binh', 78, 76, 81, 'clean', 'completed', 2], ['Nguyen Ha My', 83, 79, 91, 'clean', 'shortlisted', 2], ['Tran Duc Long', 70, 73, 68, 'review', 'review', 2], ['Pham Ngoc Mai', 58, 55, 64, 'clean', 'rejected', 2], ['Dinh Gia Bao', 86, 88, 80, 'clean', 'interview', 2], ['Vo Anh Thu', 90, 87, 93, 'clean', 'offer', 2], ['Nguyen Quoc Viet', 0, 0, 0, 'clean', 'applied', 2],
  ['Bui Minh Chau', 0, 0, 0, 'clean', 'simulation_sent', 3], ['Ta Hoai Nam', 72, 70, 76, 'clean', 'completed', 3]
];

const A = r.map((x, i) => ({
  id: i + 1, name: x[0], score: x[1], domain: x[2], soft: x[3], fraud: x[4], status: x[5], jobId: x[6],
  applied: `${String(22 - i % 18).padStart(2, '0')}/09/2026`, 
  time: x[1] ? `${35 + i % 24}m / 60m` : 'Not started',
  plagiarism: x[4] === 'review' ? 41 : Math.max(1, (i * 7) % 12), 
  tabSwitch: x[1] ? i % 8 : 0,
  summary: [
    'Strong logical analysis; consider reinforcing exception handling approaches.',
    'Clear communication style; add quantitative examples for business decisions.',
    'Good problem-solving mindset; check assumptions more carefully.'
  ][i % 3],
  history: [], 
  onboardingProgress: x[5] === 'onboarding' ? 55 : 0
}));

const $ = s => document.querySelector(s);
let jobs = JSON.parse(localStorage.getItem('edtronaut-v4-jobs') || 'null') || J,
    candidates = JSON.parse(localStorage.getItem('edtronaut-v4-candidates') || 'null') || A,
    active = +localStorage.getItem('edtronaut-v4-active') || 1,
    checked = new Set(), selected = null;

const save = () => { localStorage.setItem('edtronaut-v4-jobs', JSON.stringify(jobs)); localStorage.setItem('edtronaut-v4-candidates', JSON.stringify(candidates)); localStorage.setItem('edtronaut-v4-active', active) };
const job = () => jobs.find(j => j.id === active) || jobs[0];
const flow = j => j.flow === 'sim-first' ? 'Simulation-first' : 'CV-first';
const say = m => { let e = $('#toast'); e.textContent = m; e.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => e.classList.remove('show'), 2200) };

function list() {
  let q = $('#search').value.toLowerCase(), ro = $('#role-filter').value, sc = +$('#score-filter').value, fr = $('#fraud-filter').value, st = $('#status-filter').value;
  return candidates.filter(c => (!q || c.name.toLowerCase().includes(q)) && (!ro || c.jobId === +ro) && c.score >= sc && (fr === 'all' || c.fraud === fr) && (st === 'all' || c.status === st));
}

function opts() {
  let ro = $('#role-filter').value || String(active), st = $('#status-filter').value || 'all';
  $('#role-filter').innerHTML = `<option value="">Role: All</option>${jobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}`;
  $('#role-filter').value = ro;
  $('#status-filter').innerHTML = `<option value="all">Status: All</option>${Object.entries(S).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}`;
  $('#status-filter').value = st;
}

function metrics() {
  let a = candidates.filter(c => c.jobId === active), done = a.filter(c => c.score), n = s => a.filter(c => c.status === s).length, avg = done.length ? Math.round(done.reduce((x, c) => x + c.score, 0) / done.length) : 0;
  $('#job-title').textContent = job().title;
  $('#flow-label').textContent = `${job().department} · ${flow(job())} · Threshold ${job().threshold}%`;
  $('#total-count').textContent = a.length;
  $('#completed-count').textContent = done.length;
  $('#average-score').textContent = `${avg}/100`;
  $('#review-count').textContent = n('review');
  $('#applied-pipeline').textContent = n('applied') + n('cv_approved');
  $('#simulation-pipeline').textContent = n('simulation_sent') + n('completed') + n('review');
  $('#shortlisted-pipeline').textContent = n('shortlisted');
  $('#interview-pipeline').textContent = n('interview');
  $('#offer-pipeline').textContent = n('offer') + n('offer_accepted');
  let low = a.filter(c => c.score && c.score < job().threshold && c.status !== 'rejected').length;
  $('#bias-alert').textContent = `Review suggestion: ${low} candidates below threshold. This is a supportive alert, recruiter makes the final decision.`;
  $('#bias-alert').classList.toggle('hidden', !low);
}

function table() {
  let a = list();
  $('#result-count').textContent = `${a.length} candidates`;
  $('#empty-state').classList.toggle('hidden', !!a.length);
  $('#candidate-list').innerHTML = a.map(c => `<tr data-id="${c.id}"><td><input class="candidate-check" data-id="${c.id}" type="checkbox" ${checked.has(c.id) ? 'checked' : ''}></td><td><strong>${c.name}</strong></td><td>${jobs.find(j => j.id === c.jobId)?.title}</td><td>${c.score ? c.score + '/100' : '—'}</td><td>${c.domain ? c.domain + '%' : '—'}</td><td>${c.soft ? c.soft + '%' : '—'}</td><td><span class="badge ${c.fraud}">${c.fraud === 'clean' ? 'Clean' : 'Review'}</span></td><td><span class="status ${c.status}">${S[c.status]}</span></td><td><button class="link" data-view="${c.id}">View Details</button></td></tr>`).join('');
  $('#bulk-bar').classList.toggle('hidden', !checked.size);
  $('#selected-count').textContent = `${checked.size} candidates selected`;
  $('#select-all').checked = !!a.length && a.every(c => checked.has(c.id));
}

function jobsUI() {
  $('#job-cards').innerHTML = jobs.map(j => {
    let a = candidates.filter(c => c.jobId === j.id);
    return `<article class="job-card"><div class="job-card-top"><span class="job-state ${j.open ? 'open' : 'closed'}">${j.open ? 'Open' : 'Archived'}</span><button class="link" data-open="${j.id}">Open Dashboard</button></div><h2>${j.title}</h2><p>${j.department} · ${j.simulation}</p><dl><div><dt>Flow</dt><dd>${flow(j)}</dd></div><div><dt>Threshold</dt><dd>${j.threshold}%</dd></div><div><dt>Candidates</dt><dd>${a.length}</dd></div><div><dt>Shortlist</dt><dd>${a.filter(c => c.status === 'shortlisted').length}</dd></div></dl><div class="job-card-actions"><button class="button secondary" data-edit="${j.id}">Edit</button><button class="button secondary" data-archive="${j.id}">${j.open ? 'Archive' : 'Reopen'}</button></div></article>`;
  }).join('');
}

function onb() {
  let a = candidates.filter(c => ['offer_accepted', 'onboarding'].includes(c.status));
  $('#onboarding-list').innerHTML = a.length ? a.map(c => `<article class="job-card"><span class="job-state open">${S[c.status]}</span><h2>${c.name}</h2><p>${jobs.find(j => j.id === c.jobId)?.title}</p><div class="progress"><i style="width:${c.onboardingProgress || 0}%"></i></div><p>${c.onboardingProgress || 0}% Micro-Simulation pathway</p><div class="job-card-actions"><button class="button" data-onboard="${c.id}">${c.status === 'offer_accepted' ? 'Activate Onboarding' : 'Complete Micro-Sim'}</button></div></article>`).join('') : '<p class="empty">No candidates ready for onboarding handoff.</p>';
}

function render() { opts(); metrics(); table(); jobsUI(); onb(); }

function set(ids, status, why = '') {
  ids.forEach(id => {
    let c = candidates.find(c => c.id === id);
    c.history.push({ note: `${S[c.status]} → ${S[status]}${why ? ` (${why})` : ''}` });
    c.status = status;
  });
  checked.clear(); save(); close(); render(); say(`${ids.length} candidates: ${S[status]}`);
}

function move(c) {
  return ({
    applied: ['cv_approved', 'Approve CV'], 
    cv_approved: ['simulation_sent', 'Send Sim Invite'], 
    simulation_sent: ['completed', 'Record Submission'],
    completed: ['shortlisted', 'Move to Shortlist'], 
    review: ['completed', 'Review and Accept'], 
    shortlisted: ['interview', 'Invite to Interview'],
    interview: ['offer', 'Make Offer'], 
    offer: ['offer_accepted', 'Mark as Accepted'], 
    offer_accepted: ['onboarding', 'Handoff to Onboarding']
  }[c.status]);
}

function back(c) {
  return ({
    cv_approved: ['applied', 'Revert to Applied'], 
    simulation_sent: ['cv_approved', 'Revoke Invite'], 
    completed: ['simulation_sent', 'Revert to Sim Sent'],
    review: ['completed', 'Remove Review Flag'], 
    shortlisted: ['completed', 'Remove from Shortlist'], 
    interview: ['shortlisted', 'Revert to Shortlist'],
    offer: ['interview', 'Revoke Offer'], 
    offer_accepted: ['offer', 'Undo Acceptance'], 
    onboarding: ['offer_accepted', 'Undo Handoff'], 
    rejected: ['review', 'Reopen for Review']
  }[c.status]);
}

function detail(id) {
  let c = candidates.find(c => c.id === id), m = move(c), b = back(c), sc = !!c.score;
  $('#drawer-content').innerHTML = `<p class="eyebrow">RECRUITER DOSSIER</p><h2>${c.name}</h2><p class="candidate-meta">${jobs.find(j => j.id === c.jobId)?.title} · ${S[c.status]}</p>
    ${sc ? `<div class="detail-stats"><div>TOTAL SCORE<b>${c.score}/100</b></div><div>TIME<b>${c.time}</b></div><div>TAB SWITCHES<b>${c.tabSwitch}</b></div></div>
    <p class="summary"><b>AI recruiter summary:</b> ${c.summary}</p><p class="evidence"><b>Evidence & integrity:</b> ${c.plagiarism}\% similarity · ${c.fraud === 'review' ? 'Manual review required.' : 'No unusual flags.'}</p>
    <details><summary>Candidate-facing feedback</summary><p class="candidate-feedback">${c.summary} Tip: review edge cases and the basis for each decision.</p></details>` : '<p class="summary">No submission, score, dossier, or AI feedback yet.</p>'}
    <div class="drawer-actions">${m ? `<button class="button" data-set="${m[0]}" data-id="${c.id}">${m[1]}</button>` : ''}
    ${sc && ['completed', 'review'].includes(c.status) ? `<button class="button secondary" data-set="review" data-id="${c.id}">Flag for manual review</button>` : ''}
    ${b ? `<button class="button secondary" data-set="${b[0]}" data-id="${c.id}">${b[1]}</button>` : ''}
    ${!['rejected', 'onboarding'].includes(c.status) ? `<button class="button secondary reject" data-set="rejected" data-id="${c.id}">Reject with feedback</button>` : ''}</div>
    <p class="audit"><b>Audit log:</b> ${c.history.length ? c.history.map(x => x.note).join(' · ') : 'No changes yet.'}</p>`;
  $('#backdrop').classList.add('visible'); $('#drawer').classList.add('open');
}

function close() { $('#backdrop').classList.remove('visible'); $('#drawer').classList.remove('open'); }

function tab(t) {
  document.querySelectorAll('.view').forEach(x => x.classList.toggle('active', x.id === t + '-view'));
  document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('active', x.dataset.tab === t));
}

document.querySelectorAll('[data-tab]').forEach(x => x.onclick = () => tab(x.dataset.tab));
['#search', '#role-filter', '#score-filter', '#fraud-filter', '#status-filter'].forEach(x => $(x).addEventListener('input', table));

$('#candidate-list').onclick = e => {
  if (e.target.matches('.candidate-check')) { let id = +e.target.dataset.id; e.target.checked ? checked.add(id) : checked.delete(id); table(); return; }
  let row = e.target.closest('tr');
  if (row) detail(+(e.target.closest('[data-view]')?.dataset.view || row.dataset.id));
};

$('#select-all').onclick = e => { list().forEach(c => e.target.checked ? checked.add(c.id) : checked.delete(c.id)); table(); };
$('#bulk-bar').onclick = e => { if (e.target.dataset.bulk && checked.size) set([...checked], e.target.dataset.bulk, 'bulk action'); };
$('#close-drawer').onclick = close; $('#backdrop').onclick = close;
$('#drawer').onclick = e => e.target.dataset.set && set([+e.target.dataset.id], e.target.dataset.set);

$('#export-csv').onclick = () => {
  let rows = [['Full Name', 'Role', 'Score', 'Status'], ...list().map(c => [c.name, jobs.find(j => j.id === c.jobId).title, c.score, S[c.status]])],
      a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })), download: 'candidate-list.csv' });
  a.click(); say('CSV exported.');
};

function jobDialog(id) {
  let f = $('#job-form'); f.reset(); f.dataset.id = id || '';
  if (id) {
    let j = jobs.find(j => j.id === id);
    for (let k of ['title', 'department', 'simulation', 'threshold', 'flow']) f.elements[k].value = j[k];
  }
  $('#job-dialog').showModal();
}

$('#new-job').onclick = () => jobDialog(); $('#new-job-jobs').onclick = () => jobDialog();
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => $('#' + b.dataset.close).close());

$('#job-form').onsubmit = e => {
  e.preventDefault(); let d = Object.fromEntries(new FormData(e.currentTarget)), id = +e.currentTarget.dataset.id;
  if (id) Object.assign(jobs.find(j => j.id === id), { ...d, threshold: +d.threshold });
  else {
    let j = { id: Math.max(...jobs.map(j => j.id)) + 1, ...d, threshold: +d.threshold, duration: 60, open: true };
    jobs.push(j); active = j.id;
  }
  save(); $('#job-dialog').close(); render(); tab('jobs'); say('Job saved.');
};

$('#configure-flow').onclick = () => {
  $('#flow-job-name').textContent = job().title;
  let f = $('#flow-form').elements; f.flow.value = job().flow; f.threshold.value = job().threshold; f.duration.value = job().duration;
  $('#flow-dialog').showModal();
};

$('#flow-form').onsubmit = e => {
  e.preventDefault(); let d = Object.fromEntries(new FormData(e.currentTarget));
  Object.assign(job(), { flow: d.flow, threshold: +d.threshold, duration: +d.duration });
  if (d.applyRules) candidates.filter(c => c.jobId === active && c.score).forEach(c => {
    if (c.fraud === 'review') c.status = 'review'; else if (c.score < job().threshold) c.status = 'rejected';
  });
  save(); $('#flow-dialog').close(); render(); say('Flow Manager saved.');
};

$('#job-cards').onclick = e => {
  let id = +(e.target.dataset.open || e.target.dataset.edit || e.target.dataset.archive || 0);
  if (!id) return;
  if (e.target.dataset.open) { active = id; save(); render(); tab('candidates'); }
  if (e.target.dataset.edit) jobDialog(id);
  if (e.target.dataset.archive) {
    let j = jobs.find(j => j.id === id); j.open = !j.open; save(); render(); say(j.open ? 'Job reopened.' : 'Job archived.');
  }
};

$('#onboarding-list').onclick = e => {
  let c = candidates.find(c => c.id === +e.target.dataset.onboard); if (!c) return;
  if (c.status === 'offer_accepted') { c.status = 'onboarding'; c.onboardingProgress = 20; }
  else c.onboardingProgress = Math.min(100, c.onboardingProgress + 20);
  save(); render(); say(`${c.name}: ${c.onboardingProgress}% onboarding.`);
};

render();
// 来場者アンケート(1画面完結)
// 保存形式は従来と同じ: { prefecture: 所在地, classification: 区分+学年, university: 任意入力 }

const Y1_4 = ['1年生', '2年生', '3年生', '4年生'];
const PROGRAM_GRADES = ['2年生', '3年生', '4年生'];
const MASTER_DOCTOR = ['修士1年生', '修士2年生', '博士1年生', '博士2年生', '博士3年生'];
const DOCTOR = ['博士1年生', '博士2年生', '博士3年生'];
const prog = (label) => ({ label, grades: PROGRAM_GRADES });
const major = (label, grades = MASTER_DOCTOR) => ({ label, grades });

// label: ボタン表示 / grades: 学年 / children: 下位の所属
// 保存される学校区分は「直近の区分名(prefix があればそちら) + 学年」
const JAPAN_TREE = [
    {
        label: '電通大', university: '電通大', childTitle: '類・課程',
        children: [
            { label: 'I類', grades: ['1年生', '2年生'], childTitle: 'プログラム', children: [
                prog('メディア情報学'), prog('経営・社会情報学'), prog('情報数理工学'),
                prog('コンピュータサイエンス'), prog('データ思考・データサイエンス'),
            ] },
            { label: 'II類', grades: ['1年生', '2年生'], childTitle: 'プログラム', children: [
                prog('セキュリティ情報学'), prog('情報通信工学'), prog('電子情報学'),
                prog('計測・制御システム'), prog('先端ロボティクス'),
            ] },
            { label: 'III類', grades: ['1年生', '2年生'], childTitle: 'プログラム', children: [
                prog('機械システム'), prog('電子工学'), prog('光工学'),
                prog('物理工学'), prog('化学生命工学'),
            ] },
            { label: '夜間主', grades: Y1_4 },
            { label: '大学院', childTitle: '専攻', children: [
                major('情報学専攻'), major('情報・ネットワーク工学専攻'),
                major('機械知能システム学専攻'), major('基盤理工学専攻'),
                major('共同サステイナビリティ研究専攻', DOCTOR),
            ] },
        ],
    },
    { label: '高校', grades: ['1年生', '2年生', '3年生'] },
    { label: '高専', grades: ['1年生', '2年生', '3年生', '4年生', '5年生'] },
    { label: '他大学', grades: Y1_4 },
    { label: '他大学院', grades: MASTER_DOCTOR },
    { label: 'その他', note: '中学生以下・社会人など', prefix: '', grades: ['中学校以下', '社会人', 'その他'] },
];

// 海外(英語表示・日本語補足)。value は従来の保存形式
const g = (label, value) => ({ label, note: value, value });
const OVERSEAS_TREE = [
    { label: 'High school', note: '高校', prefix: '高校', grades: [g('1st year', '1年生'), g('2nd year', '2年生'), g('3rd year', '3年生')] },
    { label: 'Technical college', note: '高専', prefix: '高専', grades: [g('1st year', '1年生'), g('2nd year', '2年生'), g('3rd year', '3年生'), g('4th year', '4年生'), g('5th year', '5年生')] },
    { label: 'University', note: '大学', prefix: '他大学', grades: [g('1st year', '1年生'), g('2nd year', '2年生'), g('3rd year', '3年生'), g('4th year', '4年生')] },
    { label: 'Graduate school', note: '大学院', prefix: '他大学院', grades: [g('Master 1st', '修士1年生'), g('Master 2nd', '修士2年生'), g('Doctor 1st', '博士1年生'), g('Doctor 2nd', '博士2年生'), g('Doctor 3rd', '博士3年生')] },
    { label: 'Other', note: 'その他', prefix: '', grades: [g('Junior high or younger', '中学校以下'), g('Working adult', '社会人'), g('Other', 'その他')] },
];

const TEXT = {
    japan: {
        title: '来場者アンケート', school: '学校', belong: '所属', grade: '学年',
        loc: 'どこから来ましたか？', comment: '学校名・所属など（任意）', commentPh: '空欄でもOK',
        pre: 'プログラム配属前', preNote: '1・2年生',
        confirm: 'この内容で送信しますか？', back: '選び直す', where: 'どこから', commentShort: '学校名・所属',
        need: { school: '学校を選んでください', grade: '学年を選んでください', belong: '所属を選んでください', loc: '都道府県を選んでください' },
        submit: '送信する', sending: '送信中…', fail: '保存できませんでした。もう一度お試しください',
        thanks: 'ありがとうございました！', thanksSub: 'ごゆっくりご覧ください',
    },
    overseas: {
        title: 'Visitor Survey', school: 'School', belong: 'Department', grade: 'Grade',
        loc: 'Where are you from? / どこから来ましたか？', comment: 'School or affiliation (optional)', commentPh: 'Optional',
        pre: 'Before program', preNote: '',
        confirm: 'Submit this?\nこの内容で送信しますか？', back: 'Back / 選び直す', where: 'From', commentShort: 'School',
        need: { school: 'Choose your school', grade: 'Choose your grade', belong: 'Choose your department', loc: 'Enter your country' },
        submit: 'Submit / 送信する', sending: 'Sending…', fail: 'Could not save. Please try again.',
        thanks: 'Thank you!', thanksSub: 'Enjoy the lab tour. / ごゆっくりご覧ください',
    },
};

// 都道府県(地方ごと)。保存値は従来どおり「都・府・県」なし
const REGIONS = [
    ['北海道・東北', ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島']],
    ['関東', ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川']],
    ['中部', ['新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知']],
    ['近畿', ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山']],
    ['中国・四国', ['鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知']],
    ['九州・沖縄', ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄']],
];

const IDLE_RESET_MS = 90 * 1000;
const THANKS_MS = 2500;

const $ = (id) => document.getElementById(id);
const levelsEl = $('levels');
const locPane = $('locPane');
const prefSelect = $('prefSelect');
const pickedEl = $('picked');
let svgRoot = null;
const commentEl = $('comment');
const countryEl = $('country');
const submitBtn = $('submit');
const summaryEl = $('summary');

let mode = 'japan';
let path = [];        // 選んだ区分ノード(上から順に)
let grade = null;     // { label, value, prefix }
let place = '';
let sending = false;
let idleTimer = null;

// ---------- ユーティリティ ----------
function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) {
        if (c == null || c === false) continue;
        node.append(c instanceof Node ? c : document.createTextNode(c));
    }
    return node;
}

const normGrade = (gr) => (typeof gr === 'string' ? { label: gr, value: gr } : gr);
const prefixOf = (node) => (node.prefix !== undefined ? node.prefix : node.label);

// 「I類」のように学年と下位所属の両方を持つノードは、「配属前」を選択肢の先頭に加える
function optionsOf(node) {
    if (!node.children) return null;
    if (!node.grades) return node.children;
    if (!node._pre) {
        const t = TEXT[mode];
        node._pre = { label: t.pre, note: t.preNote, prefix: node.label, grades: node.grades };
    }
    return [node._pre, ...node.children];
}

const classification = () => (grade ? grade.prefix + grade.value : '');
// 画面に出す学年(海外の方には英語で表示。保存する値は classification())
const gradeText = () => (mode === 'overseas' ? `${path[0].label} · ${grade.label}` : (classification() || 'その他'));

// ---------- 左側: 学校・所属・学年 ----------
function renderLevels(appearFrom = Infinity) {
    const t = TEXT[mode];
    const rows = [];
    let options = mode === 'japan' ? JAPAN_TREE : OVERSEAS_TREE;
    let depth = 0;
    let title = t.school;

    while (options) {
        const selected = path[depth];
        const d = depth;
        rows.push(levelRow(title, options, (o) => o === selected, (o) => pickNode(d, o), !!selected));
        if (!selected) break;
        depth += 1;
        title = selected.childTitle || t.belong;
        options = optionsOf(selected);
        if (!options) {
            const prefix = prefixOf(selected);
            const grades = selected.grades.map(normGrade);
            rows.push(levelRow(t.grade, grades, (gr) => grade && grade.prefix === prefix && grade.value === gr.value,
                (gr) => pickGrade(prefix, gr), !!grade));
        }
    }

    rows.forEach((row, i) => {
        row.querySelector('.num').textContent = row.classList.contains('done') ? '✓' : String(i + 1);
        if (i >= appearFrom) row.classList.add('appear');
    });
    levelsEl.replaceChildren(...rows);
}

function levelRow(title, items, isSelected, onPick, done) {
    return el('div', { class: `level${done ? ' done' : ''}` },
        el('div', { class: 'level-title' }, el('span', { class: 'num' }), title),
        el('div', { class: 'chips' }, items.map((item) =>
            el('button', { type: 'button', class: 'chip', 'aria-pressed': String(isSelected(item)), onclick: () => onPick(item) },
                item.label, item.note ? el('small', {}, item.note) : null))));
}

function pickNode(depth, node) {
    if (path[depth] === node) return;
    path = path.slice(0, depth).concat(node);
    grade = null;
    if (depth === 0) commentEl.value = node.university || '';
    renderLevels(depth + 1);
    update();
}

function pickGrade(prefix, gr) {
    grade = { ...gr, prefix };
    renderLevels();
    update();
}

// ---------- 右側: 日本地図 / 国名 ----------
function setLocation(name) {
    place = name || '';
    prefSelect.value = mode === 'japan' ? place : '';
    if (svgRoot) {
        svgRoot.querySelectorAll('.prefecture').forEach((p) =>
            p.classList.toggle('selected', p.dataset.name === place));
    }
    update();
}

prefSelect.addEventListener('change', () => setLocation(prefSelect.value));

// リスト(予備): 地方ごとにまとめて表示
REGIONS.forEach(([region, prefs]) => {
    prefSelect.append(el('optgroup', { label: region }, prefs.map((n) => el('option', { value: n }, n))));
});

async function loadMap() {
    const box = $('mapBox');
    try {
        const res = await fetch('image/map-full.svg');
        if (!res.ok) throw new Error('map');
        const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
        doc.querySelectorAll('script, title').forEach((n) => {
            if (n.tagName === 'script' || n.parentNode === doc.documentElement) n.remove();
        });
        svgRoot = document.importNode(doc.documentElement, true);
        svgRoot.removeAttribute('class');
        svgRoot.setAttribute('role', 'img');
        svgRoot.setAttribute('aria-label', '日本地図');

        svgRoot.querySelectorAll('.prefecture').forEach((p) => {
            const t = p.querySelector('title');
            const name = t ? t.textContent.split(' / ')[0].trim() : '';
            p.dataset.name = name;
            // 地図をタップしたら、左側が答え終わっていればそのまま送信する
            p.addEventListener('click', () => {
                if (sending) return;
                setLocation(name);
                if (!missingKey()) openConfirm();
            });
        });

        box.replaceChildren(svgRoot);
        // 余白を切り詰めて、枠いっぱいに大きく表示する
        try {
            const group = svgRoot.querySelector('.svg-map');
            const b = group.getBBox();
            const t = group.transform.baseVal.consolidate();
            const m = t ? t.matrix : { a: 1, e: 0, f: 0 };
            const pad = 6;
            svgRoot.setAttribute('viewBox', [b.x * m.a + m.e - pad, b.y * m.a + m.f - pad, b.width * m.a + pad * 2, b.height * m.a + pad * 2].join(' '));
        } catch (e) { /* そのまま表示 */ }
        setLocation(place);
    } catch (e) {
        box.replaceChildren(el('p', { class: 'hint' }, '地図を読み込めませんでした。下のリストから選んでください。'));
    }
}

countryEl.addEventListener('input', () => { place = countryEl.value.trim(); update(); });

// ---------- 次に選ぶ場所の強調 + 送信バー ----------
function missingKey() {
    if (!path.length) return 'school';
    if (!grade) return optionsOf(path[path.length - 1]) ? 'belong' : 'grade';
    if (!place) return 'loc';
    return null;
}

function update() {
    const t = TEXT[mode];
    const need = missingKey();
    const leftDone = need === 'loc' || need === null;

    // 左側: 未選択の行(=最後の行)を強調
    const rows = [...levelsEl.querySelectorAll('.level')];
    rows.forEach((row, i) => {
        const isTarget = !leftDone && i === rows.length - 1;
        row.classList.toggle('target', isTarget);
        if (isTarget && row.classList.contains('appear')) {
            row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    });

    // 右側: 左が終わるまでは控えめに表示、次の番になったら強調
    if (need === 'loc' && !locPane.classList.contains('target')) {
        // スマホなど縦並びのとき、都道府県の欄まで自動でスクロール
        setTimeout(() => locPane.scrollIntoView({ block: 'start', behavior: 'smooth' }), 150);
    }
    locPane.classList.toggle('target', need === 'loc');
    locPane.classList.toggle('waiting', !leftDone && !place);
    $('locNum').textContent = place ? '✓' : String(rows.length + 1);
    locPane.classList.toggle('done', !!place);

    pickedEl.textContent = place || '地図をタップしてください';
    pickedEl.classList.toggle('empty', !place);

    if (!sending) {
        submitBtn.disabled = !!need;
        submitBtn.textContent = need ? t.need[need] : t.submit;
        submitBtn.classList.toggle('ready', !need);
    }
    const parts = [];
    if (grade) parts.push(el('span', {}, `${t.grade}: `, el('b', {}, gradeText())));
    if (place) parts.push(el('span', {}, `${mode === 'japan' ? '所在地' : 'Country'}: `, el('b', {}, place)));
    summaryEl.replaceChildren(...parts);
}

submitBtn.addEventListener('click', () => openConfirm());

// ---------- 送信前の確認 ----------
const confirmEl = $('confirm');

function openConfirm() {
    if (missingKey() || sending) return;
    const t = TEXT[mode];
    $('confirmTitle').textContent = t.confirm;
    $('confirmBack').textContent = t.back;
    $('confirmOk').textContent = t.submit;
    const items = [[t.grade, gradeText()], [t.where, place]];
    const comment = commentEl.value.trim();
    if (comment) items.push([t.commentShort, comment]);
    $('confirmList').replaceChildren(...items.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, v)]));
    confirmEl.hidden = false;
    $('confirmOk').focus();
}

function closeConfirm() { confirmEl.hidden = true; }

$('confirmBack').addEventListener('click', closeConfirm);
$('confirmOk').addEventListener('click', () => { closeConfirm(); submit(); });
confirmEl.addEventListener('click', (e) => { if (e.target === confirmEl) closeConfirm(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !confirmEl.hidden) closeConfirm(); });

async function submit() {
    if (missingKey() || sending) return;
    const t = TEXT[mode];
    sending = true;
    submitBtn.disabled = true;
    submitBtn.classList.remove('ready');
    submitBtn.textContent = t.sending;
    try {
        const res = await fetch('/append-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prefecture: place, classification: classification(), university: commentEl.value.trim() }),
        });
        if (!res.ok || (await res.text()) !== 'Saved') throw new Error('save failed');
        sending = false;
        showThanks();
    } catch (e) {
        sending = false;
        update();
        summaryEl.replaceChildren(el('span', { style: 'color:#b3261e' }, t.fail));
    }
}

function showThanks() {
    const t = TEXT[mode];
    const overlay = $('thanks');
    $('thanksTitle').textContent = t.thanks;
    $('thanksSub').textContent = t.thanksSub;
    $('thanksWhat').textContent = `${place}・${gradeText()}`;
    overlay.hidden = false;
    const close = () => { clearTimeout(timer); overlay.hidden = true; overlay.onclick = null; resetForm('japan'); };
    const timer = setTimeout(close, THANKS_MS);
    overlay.onclick = close;
}

// ---------- 日本 / 海外 切り替え ----------
function resetForm(newMode = mode) {
    mode = newMode;
    path = [];
    grade = null;
    place = '';
    commentEl.value = '';
    countryEl.value = '';
    const t = TEXT[mode];
    document.querySelectorAll('.seg button').forEach((b) =>
        b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
    $('title').textContent = t.title;
    $('locLabel').textContent = t.loc;
    $('commentLabel').textContent = t.comment;
    commentEl.placeholder = t.commentPh;
    $('japanLoc').hidden = mode !== 'japan';
    $('overseasLoc').hidden = mode !== 'overseas';
    document.documentElement.lang = mode === 'japan' ? 'ja' : 'en';
    $('formPane').scrollTop = 0;
    renderLevels();
    setLocation('');
}

document.querySelectorAll('.seg button').forEach((b) =>
    b.addEventListener('click', () => { if (b.dataset.mode !== mode) resetForm(b.dataset.mode); }));

// 一定時間操作がなければ入力をクリア(受付端末向け)
function bumpIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => resetForm('japan'), IDLE_RESET_MS);
}
['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, bumpIdle, { passive: true }));

resetForm('japan');
loadMap();

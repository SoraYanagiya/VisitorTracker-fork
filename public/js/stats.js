// 左下の「今日の来場者」: 来場者がどこから来たかを日本地図の濃淡と上位ランキングで表示する
(() => {
    const STEPS = 5;           // 濃淡の段階数 (--seq-1 〜 --seq-5)
    const TOP_N = 5;
    const miniMap = document.getElementById('miniMap');
    const rankEl = document.getElementById('rank');
    const legendEl = document.getElementById('legend');
    const totalEl = document.getElementById('statsTotal');
    const tip = document.getElementById('tip');
    const statsEl = document.getElementById('stats');

    // data-code(JIS都道府県コード) → 保存名
    const PREF_NAMES = [null,
        '北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '茨城', '栃木', '群馬',
        '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野',
        '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山',
        '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡',
        '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];
    const PREF_SET = new Set(PREF_NAMES.filter(Boolean));

    let svg = null;
    let counts = new Map();
    let max = 0;

    // 人数 → 濃さの段階(0 は人がいない県)
    const stepOf = (n) => {
        if (!n) return 0;
        if (max <= 1) return STEPS;
        return 1 + Math.round(((n - 1) / (max - 1)) * (STEPS - 1));
    };

    async function loadMiniMap() {
        const res = await fetch('image/map-full.svg');
        if (!res.ok) return;
        const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
        doc.querySelectorAll('script, title').forEach((n) => n.remove());
        svg = document.importNode(doc.documentElement, true);
        svg.removeAttribute('class');
        svg.setAttribute('aria-hidden', 'true');
        svg.querySelectorAll('.prefecture').forEach((p) => {
            p.dataset.name = PREF_NAMES[Number(p.dataset.code)] || '';
            p.addEventListener('pointerenter', (e) => showTip(p, e));
            p.addEventListener('pointermove', (e) => showTip(p, e));
            p.addEventListener('pointerleave', hideTip);
            p.addEventListener('click', (e) => { showTip(p, e); clearTimeout(tip._t); tip._t = setTimeout(hideTip, 1800); });
        });
        miniMap.replaceChildren(svg);
        fitViewBox(svg);
        paint();
    }

    function fitViewBox(root) {
        try {
            const group = root.querySelector('.svg-map');
            const b = group.getBBox();
            const t = group.transform.baseVal.consolidate();
            const m = t ? t.matrix : { a: 1, e: 0, f: 0 };
            root.setAttribute('viewBox', [b.x * m.a + m.e - 4, b.y * m.a + m.f - 4, b.width * m.a + 8, b.height * m.a + 8].join(' '));
        } catch (e) { /* そのまま */ }
    }

    function showTip(p, e) {
        const name = p.dataset.name;
        const n = counts.get(name) || 0;
        const box = statsEl.getBoundingClientRect();
        tip.textContent = `${name}  ${n}人`;
        tip.style.left = `${e.clientX - box.left}px`;
        tip.style.top = `${e.clientY - box.top}px`;
        tip.hidden = false;
    }
    function hideTip() { tip.hidden = true; }

    function paint() {
        if (!svg) return;
        svg.querySelectorAll('.prefecture').forEach((p) => {
            const step = stepOf(counts.get(p.dataset.name) || 0);
            const color = `var(--seq-${step})`;
            p.style.setProperty('fill', color);
            p.querySelectorAll('*').forEach((c) => c.style.setProperty('fill', color));
        });
    }

    function renderRank(total) {
        totalEl.textContent = total;
        const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, TOP_N);
        if (!top.length) {
            rankEl.replaceChildren(Object.assign(document.createElement('li'), {
                className: 'empty', textContent: 'まだ記録がありません。最初の1人になりませんか？',
            }));
        } else {
            rankEl.replaceChildren(...top.map(([name, n]) => {
                const li = document.createElement('li');
                li.innerHTML = '<span class="name"></span><span class="track"><span class="fill"></span></span><span class="count"></span>';
                li.querySelector('.name').textContent = name;
                li.querySelector('.name').title = name;
                li.querySelector('.fill').style.width = `${(n / top[0][1]) * 100}%`;
                li.querySelector('.count').textContent = n;
                return li;
            }));
        }
        // 凡例: 少 ■■■■■ 多(最大N人)
        legendEl.innerHTML = '<span>少</span><span class="sw"></span><span>多</span>';
        const sw = legendEl.querySelector('.sw');
        for (let i = 1; i <= STEPS; i++) {
            const c = document.createElement('i');
            c.style.background = `var(--seq-${i})`;
            sw.append(c);
        }
        legendEl.append(Object.assign(document.createElement('span'), { textContent: max ? `最多 ${max}人` : '', className: 'legend-max' }));
    }

    async function refresh() {
        let rows = [];
        try {
            rows = await fetch('/api/logs').then((r) => r.json());
        } catch (e) { return; }
        counts = new Map();
        rows.forEach((r) => {
            const place = (r['学校所在地'] || '').trim();
            if (place) counts.set(place, (counts.get(place) || 0) + 1);
        });
        // 地図の濃淡は国内の県だけで最大値を決める
        max = Math.max(0, ...[...counts].filter(([k]) => PREF_SET.has(k)).map(([, v]) => v));
        renderRank(rows.length);
        paint();
    }

    // 新しい記録が入ったら(他の端末からも)自動で更新
    function connect() {
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        const socket = new WebSocket(`${proto}://${location.host}`);
        socket.onmessage = (e) => { if (e.data === 'Update') refresh(); };
        socket.onclose = () => setTimeout(connect, 3000);
    }

    loadMiniMap();
    refresh();
    connect();
})();

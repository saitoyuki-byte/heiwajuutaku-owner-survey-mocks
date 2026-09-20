'use strict';
const $ = (id) => document.getElementById(id);
const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const required = '<b class="required">必須</b>';
const field = (id, label, options = {}) => {
  const {type = 'text', placeholder = '', optional = false, hint = '', attrs = '', textarea = false} = options;
  return `<div class="field"><label for="${id}">${label}${optional ? '<span class="optional">任意</span>' : required}</label>${textarea ? `<textarea id="${id}" name="${id}"` : `<input type="${type}" id="${id}" name="${id}"`} ${optional ? '' : 'required'} placeholder="${placeholder}" ${attrs} aria-describedby="${id}-hint">${textarea ? '</textarea>' : ''}<small id="${id}-hint">${hint}</small></div>`;
};
const select = (id, label, choices, hint = '') => `<div class="field"><label for="${id}">${label}${required}</label><select id="${id}" name="${id}" required aria-describedby="${id}-hint"><option value="">選択してください</option>${choices.map(x=>`<option>${x}</option>`).join('')}</select><small id="${id}-hint">${hint}</small></div>`;
const radios = (id, label, choices) => `<fieldset class="field"><legend>${label}${required}</legend><div class="choices">${choices.map(([value,text])=>`<label class="choice"><input type="radio" name="${id}" value="${value}" required><span>${text}</span></label>`).join('')}</div></fieldset>`;
const section = (id, number, title, subtitle, body) => `<section class="section-card" id="${id}"><header class="section-heading"><span class="section-number">${number}</span><div><h2>${title}</h2><p>${subtitle}</p></div></header><div class="section-body">${body}</div></section>`;

$('form-sections').innerHTML = [
  section('property','01','物件・退去日','ご契約中の物件と、退去のご予定をお知らせください。',`
    <div class="field"><label for="property-search">物件名・月極駐車場名${required}</label><div class="property-search"><svg class="search-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="m12 12 5 5"/></svg><input id="property-search" name="property-search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="property-options" aria-describedby="property-hint" autocomplete="off" placeholder="物件名・フリガナ・物件番号で検索" required><div id="property-options" class="suggestions" role="listbox" aria-label="物件の候補" hidden></div></div><small id="property-hint">文字を入力し、表示された候補から物件を選択してください。</small><div id="selected-property" class="selected-property" hidden></div></div>
    ${field('unit','号室・駐車場番号',{placeholder:'例：101号室 ／ 駐車場 No.3',attrs:'maxlength="80"'})}
    <div id="parking-choice">${radios('scope','解約する内容',[['room','お部屋（駐車場含む）'],['parking','駐車場のみ']])}</div>
    <div id="no-inspection" class="info-note" role="status" hidden></div>
    <div class="grid-two">${field('move-date','退去明渡日',{type:'date',hint:'契約書の解約予告期間をご確認ください。'})}<div id="inspection-field">${select('inspection','退去立会希望時間',['未定（後日連絡）','10:00','11:00','12:00','13:00','14:00','15:00','16:00'])}</div></div>
    <div id="room-note" class="info-note">退去明渡日に立会いを行い、鍵を回収します。立会い後はお部屋に入れません。希望時間は確定ではなく、当社からの連絡をお待ちください。</div>
    <div id="key-return" hidden>${select('key-store','トランクルームの鍵返却先',['黒松駅前本店（泉区旭丘堤2丁目21-4）','仙台駅前店（青葉区中央3丁目10-12）','仙台駅東口店（宮城野区元寺小路300-1）','国分町店（青葉区国分町2丁目8-17）'])}</div>
    <details class="small-details"><summary>解約日・立会いに関する注意事項</summary><ul><li>解約日はお申し込みから1か月以上先の日付です。契約によっては2か月・3か月前の予告が必要です。</li><li>契約条項以前の解約日の通知は無効となります。</li><li>最終賃料の日割・月割や短期違約金は契約書に準じます。</li><li>当社休業日（お盆・年末年始等）は退去立会いを行えません。</li></ul></details>
  `),
  section('contract','02','ご契約者情報','ご契約名義と、ご連絡先をご入力ください。',`
    ${radios('contract-type','ご契約の区分',[['individual','個人契約'],['company','法人契約']])}
    ${field('contract-name','契約者名',{placeholder:'例：平和 太郎',attrs:'autocomplete="name" maxlength="120"'})}
    <div id="company-fields" class="inset" hidden><div class="grid-two">${field('department','担当部署',{placeholder:'例：総務部',attrs:'maxlength="120"'})}${field('contact-person','担当者名',{placeholder:'例：平和 太郎',attrs:'maxlength="120"'})}</div></div>
    ${field('resident','入居者名',{placeholder:'契約者と異なる場合にご入力ください',optional:true,attrs:'maxlength="120"'})}
    ${field('phone','電話番号',{type:'tel',placeholder:'例：09012345678',hint:'日中に連絡の取れる番号をご入力ください。',attrs:'autocomplete="tel" inputmode="tel" maxlength="20"'})}
    ${field('email','メールアドレス',{type:'email',placeholder:'例：taro@example.com',hint:'ご契約者さま（法人はご担当者さま）のメールアドレスをご入力ください。',attrs:'autocomplete="email" maxlength="254"'})}
    ${field('email-confirm','メールアドレス（確認）',{type:'email',placeholder:'確認のため、もう一度ご入力ください',attrs:'autocomplete="off" maxlength="254"'})}
    <p class="hint">heiwajuutaku.com のメールを受信できるようご設定ください。5日以内に当社から連絡がない場合は、必ずお問い合わせください。</p>
  `),
  section('moving','03','転居先について','退去の理由と、次のお住まいについてお知らせください。',`
    ${select('reason','退去理由',['卒業','転勤','就職・退職','実家へ転居','住み替え','契約満了','自宅購入','帰国','通勤・通学に不便','生活環境が悪い','家庭の事情','その他'])}
    <div id="reason-extra" hidden>${field('reason-detail','退去理由の詳細',{textarea:true,placeholder:'差し支えない範囲でお知らせください',attrs:'maxlength="1000"'})}</div>
    ${radios('destination','転居先はお決まりですか？',[['decided','決定済み'],['undecided','未定']])}
    <div id="address-fields" class="inset" hidden>${field('postal','転居先の郵便番号',{placeholder:'例：980-0000',attrs:'inputmode="numeric" autocomplete="postal-code" maxlength="8"'})}${field('address','転居先住所',{textarea:true,placeholder:'都道府県・市区町村・番地・建物名・部屋番号',attrs:'autocomplete="street-address" maxlength="500"',hint:'精算書等の送付先として使用します。精算書はメールで送付する場合もあります。'})}</div>
    ${radios('introduction','転居先のご紹介を希望されますか？',[['yes','紹介を希望する'],['no','希望しない']])}
    <div id="area-field" hidden>${field('area','紹介を希望するエリア',{placeholder:'例：仙台市青葉区、地下鉄南北線沿線',hint:'仙台圏以外は、全国のアパマンショップまたは提携不動産会社からのご紹介となります。',attrs:'maxlength="200"'})}</div>
  `),
  section('refund','04','ご返金先・その他','敷金・過剰金等のご返金がある場合に使用します。',`
    <div class="info-note">返金に伴う振込手数料はお客さまのご負担となります。口座情報にお間違いがないか、ご確認ください。</div>
    <div class="grid-two">${field('bank','金融機関名',{placeholder:'金融機関名を入力して選択',attrs:'list="bank-list" autocomplete="off" maxlength="100"'})}${field('branch','支店名',{placeholder:'金融機関を選んでから入力',attrs:'list="branch-list" autocomplete="off" maxlength="100"'})}</div>
    <datalist id="bank-list">${['七十七銀行','仙台銀行','杜の都信用金庫','宮城第一信用金庫','ゆうちょ銀行','三菱UFJ銀行','三井住友銀行','みずほ銀行'].map(x=>`<option value="${x}">`).join('')}</datalist><datalist id="branch-list"></datalist>
    <p class="hint" style="margin:-12px 0 22px">※この試作では候補を一部収録しています。支店候補はデモ用です。候補にない名称も入力できます。</p>
    ${radios('account-type','口座種別',[['普通','普通'],['当座','当座']])}
    ${field('account-number','口座番号',{placeholder:'例：1234567',hint:'7桁の半角数字でご入力ください。ゆうちょ銀行は振込用の店名・口座番号をご入力ください。',attrs:'inputmode="numeric" maxlength="7" autocomplete="off"'})}
    <div class="grid-two">${field('account-name','口座名義',{placeholder:'例：平和 太郎',attrs:'maxlength="120" autocomplete="off"'})}${field('account-kana','口座名義のフリガナ',{placeholder:'例：ヘイワ タロウ',attrs:'maxlength="120" autocomplete="off"'})}</div>
    ${field('notes','備考',{textarea:true,optional:true,placeholder:'その他、ご連絡事項がございましたらご記入ください。',attrs:'maxlength="2000"'})}
  `)
].join('');

const form = $('cancel-form');
const props = (window.PROPERTIES || []).filter(p => !normalize(p.name).includes('空キ番号')).map(p => ({...p, search:normalize(p.name+' '+p.kana+' '+p.id)}));
let selected = null;
let matches = [];
let activeOption = -1;
let validated = false;
function normalize(s) { return s.normalize('NFKC').toLowerCase().replace(/[\u3041-\u3096]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60)).replace(/\s+/g,''); }
const radioValue = name => form.querySelector(`input[name="${name}"]:checked`)?.value || '';
const val = id => $(id).value.trim();
function toggle(id, visible) {
  const group = $(id);
  group.hidden = !visible;
  group.querySelectorAll('input,select,textarea').forEach(el => { el.disabled = !visible; if (!visible) clearError(el); });
}
function isTrunk() { return selected && selected.kind === 'trunk'; }
function isParking() { return selected && selected.kind === 'parking'; }
function noInspection() { return isTrunk() || isParking() || radioValue('scope') === 'parking'; }
function updateConditions() {
  toggle('parking-choice', !isParking() && !isTrunk());
  toggle('inspection-field', !noInspection());
  $('room-note').hidden = !!noInspection();
  $('no-inspection').hidden = !noInspection();
  $('no-inspection').textContent = isTrunk() ? 'トランクルームの解約には立会いがありません。下記で鍵の返却先店舗をお選びください。' : '駐車場のみの解約には立会いがありません。希望時間の入力は不要です。';
  toggle('key-return', !!isTrunk());
  const company = radioValue('contract-type') === 'company';
  toggle('company-fields', company);
  $('contract-name').previousElementSibling.innerHTML = (company ? '法人名' : '契約者名') + required;
  $('contract-name').placeholder = company ? '例：株式会社 平和商事' : '例：平和 太郎';
  toggle('reason-extra', val('reason') === 'その他');
  toggle('address-fields', radioValue('destination') === 'decided');
  toggle('area-field', radioValue('introduction') === 'yes');
  updateProgress();
}
function closeOptions() { $('property-options').hidden = true; $('property-search').setAttribute('aria-expanded','false'); $('property-search').removeAttribute('aria-activedescendant'); activeOption = -1; }
function showOptions() {
  const query = normalize(val('property-search'));
  if (!query || (selected && val('property-search') === selected.name)) return closeOptions();
  matches = props.filter(p=>p.search.includes(query)).slice(0,30);
  activeOption = -1;
  $('property-options').innerHTML = matches.length ? matches.map((p,i)=>`<div id="property-option-${i}" role="option" aria-selected="false" class="suggestion" data-index="${i}"><span>${escapeHTML(p.id)}</span><span><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.kind === 'trunk' ? 'トランクルーム' : p.category)}</small></span></div>`).join('') : '<div class="suggestion-empty">該当する物件がありません。物件名の一部や番号でお試しください。</div>';
  $('property-options').hidden = false;
  $('property-search').setAttribute('aria-expanded','true');
}
function chooseProperty(index) {
  selected = matches[index];
  if (!selected) return;
  $('property-search').value = selected.name;
  $('selected-property').hidden = false;
  $('selected-property').innerHTML = `✓ 選択済み <strong>${escapeHTML(selected.name)}</strong><span>物件番号 ${escapeHTML(selected.id)}</span>`;
  closeOptions();clearError($('property-search'));updateConditions();
}
$('property-search').addEventListener('input',()=>{
  selected=null; $('selected-property').hidden=true; showOptions();updateConditions();
});
$('property-search').addEventListener('focus',showOptions);
$('property-options').addEventListener('mousedown',e=>e.preventDefault());
$('property-options').addEventListener('click',e=>{const item=e.target.closest('[data-index]');if(item)chooseProperty(Number(item.dataset.index));});
$('property-search').addEventListener('keydown',e=>{
  if(e.key==='Escape')return closeOptions();
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();if($('property-options').hidden)showOptions();if(!matches.length)return;
    activeOption=activeOption<0?(e.key==='ArrowDown'?0:matches.length-1):(activeOption+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length;
    [...$('property-options').querySelectorAll('[role=option]')].forEach((o,i)=>o.setAttribute('aria-selected',String(i===activeOption)));
    const option=$(`property-option-${activeOption}`);$('property-search').setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'});
  }else if(e.key==='Enter'&&!$('property-options').hidden){e.preventDefault();if(activeOption>=0)chooseProperty(activeOption);}
});
document.addEventListener('click',e=>{if(!e.target.closest('.property-search'))closeOptions();});
$('property-search').addEventListener('blur',closeOptions);

const today = new Date();
const nextMonth = new Date(today.getFullYear(),today.getMonth()+1,1);
nextMonth.setDate(Math.min(today.getDate(),new Date(nextMonth.getFullYear(),nextMonth.getMonth()+1,0).getDate()));
const dateString = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
$('move-date').min=dateString(nextMonth);
$('move-date-hint').textContent=`1か月前予告の場合、${nextMonth.getFullYear()}年${nextMonth.getMonth()+1}月${nextMonth.getDate()}日以降。2・3か月前予告等の契約条件もご確認ください。`;
function updateBranches() {
  $('branch').value='';
  $('branch-list').innerHTML=val('bank') ? ['本店営業部（デモ）','仙台支店（デモ）','泉支店（デモ）'].map(s=>`<option value="${s}">`).join('') : '';
}
$('bank').addEventListener('input',updateBranches);
function controls(container=form) { return [...container.querySelectorAll('input,select,textarea')].filter(el=>!el.disabled); }
function errorFor(el) {
  if(el.disabled)return '';
  if(el.id==='property-search'&&!selected)return '候補から物件を選択してください。';
  if(el.type==='radio')return radioValue(el.name)?'':'いずれかを選択してください。';
  if(el.type==='checkbox')return el.required&&!el.checked?'確認・同意のチェックが必要です。':'';
  if(el.required&&!el.value.trim())return 'この項目を入力してください。';
  if(el.type==='email'&&el.validity.typeMismatch)return 'メールアドレスの形式をご確認ください。';
  if(el.id==='email-confirm'&&val('email')!==val('email-confirm'))return 'メールアドレスが一致していません。';
  if(el.id==='phone'&&!/^[0-9+()\-\s]{10,20}$/.test(el.value))return '電話番号を半角数字で正しく入力してください。';
  if(el.id==='account-number'&&!/^\d{7}$/.test(el.value))return '口座番号を7桁の半角数字で入力してください。';
  if(el.id==='account-kana'&&!/^[ァ-ヶー\uFF66-\uFF9F\s（）().．・\-Ａ-ＺA-Z０-９0-9]+$/.test(el.value))return '口座名義のフリガナをカタカナで入力してください。';
  if(el.id==='postal'&&!/^\d{3}-?\d{4}$/.test(el.value))return '郵便番号を7桁の半角数字で入力してください。';
  if(el.id==='move-date'&&(el.validity.rangeUnderflow||el.value<$('move-date').min))return '退去明渡日はお申し込みから1か月以上先の日付をお選びください。';
  return '';
}
function errorHost(el) { return el.closest('.field') || el.closest('.check-label'); }
function clearError(el) {
  el.removeAttribute('aria-invalid');
  const host=errorHost(el);if(host)host.querySelector('.field-error')?.remove();
  const ids=(el.getAttribute('aria-describedby')||'').split(' ').filter(x=>x&&!x.startsWith('error-'));if(ids.length)el.setAttribute('aria-describedby',ids.join(' '));else el.removeAttribute('aria-describedby');
}
function displayError(el,message) {
  clearError(el);if(!message)return;
  el.setAttribute('aria-invalid','true');const host=errorHost(el);if(!host)return;
  const p=document.createElement('p');p.className='field-error';p.id=`error-${el.id||el.name}`;p.textContent=message;host.appendChild(p);el.setAttribute('aria-describedby',`${el.getAttribute('aria-describedby')||''} ${p.id}`.trim());
}
function distinctControls(container=form) { const seen=new Set();return controls(container).filter(el=>{if(el.type!=='radio')return true;if(seen.has(el.name))return false;seen.add(el.name);return true;}); }
function updateProgress() {
  const requiredInputs=distinctControls().filter(el=>el.required);
  const filled=requiredInputs.filter(el=>!errorFor(el)).length;
  const percent=Math.round(filled/requiredInputs.length*100);
  $('progress-text').textContent=`${percent}%`;$('progress-fill').style.width=`${percent}%`;
  document.querySelectorAll('.section-card').forEach(section=>{
    const complete=distinctControls(section).filter(el=>el.required).every(el=>!errorFor(el));
    const link=document.querySelector(`.navigation-card a[href="#${section.id}"]`);link.classList.toggle('complete',complete);link.querySelector('i').textContent=complete?'✓':'';
  });
}
form.addEventListener('change',()=>{updateConditions();if(validated){distinctControls().forEach(el=>displayError(el,errorFor(el)));}});
form.addEventListener('input',e=>{if(validated)displayError(e.target,errorFor(e.target));updateProgress();});
function setView(name) {
  ['entry','review','complete'].forEach(n=>$(`${n}-view`).hidden=n!==name);
  const step=['entry','review','complete'].indexOf(name);
  document.querySelectorAll('.stepper li').forEach((li,i)=>{li.classList.toggle('current',i===step);li.classList.toggle('done',i<step);if(i===step)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  if(name!=='entry') { $(`${name}-title`).focus({preventScroll:true}); document.querySelector('.stepper').scrollIntoView({behavior:'smooth',block:'start'}); }
}
function reviewData() {
  const company=radioValue('contract-type')==='company';
  return [
    ['property','物件・退去日',[
      ['物件名',selected.name],['物件番号',selected.id],['号室・駐車場番号',val('unit')],['解約内容',isTrunk()?'トランクルーム':noInspection()?'駐車場のみ':'お部屋（駐車場含む）'],['退去明渡日',val('move-date')],
      ...(!noInspection()?[['退去立会希望時間',val('inspection')]]:[['退去立会い','なし']]),...(isTrunk()?[['鍵返却先店舗',val('key-store')]]:[])
    ]],
    ['contract','ご契約者情報',[
      ['ご契約の区分',company?'法人契約':'個人契約'],[company?'法人名':'契約者名',val('contract-name')],...(company?[['担当部署',val('department')],['担当者名',val('contact-person')]]:[]),['入居者名',val('resident')||'—'],['電話番号',val('phone')],['メールアドレス',val('email')]
    ]],
    ['moving','転居先について',[
      ['退去理由',val('reason')],...(val('reason')==='その他'?[['退去理由の詳細',val('reason-detail')]]:[]),['転居先',radioValue('destination')==='decided'?'決定済み':'未定'],...(radioValue('destination')==='decided'?[['郵便番号',val('postal')],['転居先住所',val('address')]]:[]),['転居先のご紹介',radioValue('introduction')==='yes'?'希望する':'希望しない'],...(radioValue('introduction')==='yes'?[['希望エリア',val('area')]]:[])
    ]],
    ['refund','ご返金先・その他',[
      ['金融機関名',val('bank')],['支店名',val('branch')],['口座種別',radioValue('account-type')],['口座番号',val('account-number')],['口座名義',val('account-name')],['フリガナ',val('account-kana')],['備考',val('notes')||'—'],['注意事項・個人情報の取り扱い','確認・同意済み']
    ]]
  ];
}
form.addEventListener('submit',e=>{
  e.preventDefault();closeOptions();validated=true;
  const errors=[];distinctControls().forEach(el=>{const error=errorFor(el);displayError(el,error);if(error)errors.push(el);});
  if(errors.length){$('form-error').hidden=false;$('form-error').textContent=`未入力、または確認が必要な項目が${errors.length}件あります。各項目をご確認ください。`;errors[0].focus();errors[0].scrollIntoView({behavior:'smooth',block:'center'});return;}
  $('form-error').hidden=true;
  $('review-content').innerHTML=reviewData().map(([id,title,rows])=>`<section class="review-card"><header><h3>${title}</h3><button type="button" class="edit-button" data-section="${id}" aria-label="${title}を修正する">修正する</button></header><dl>${rows.map(([label,value])=>`<div class="review-row"><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl></section>`).join('');
  setView('review');
});
function backTo(id='property') {setView('entry');$(id).scrollIntoView({behavior:'smooth',block:'start'});$(id).querySelector('input:not(:disabled),select:not(:disabled)')?.focus({preventScroll:true});}
$('review-content').addEventListener('click',e=>{const button=e.target.closest('[data-section]');if(button)backTo(button.dataset.section);});
$('back-button').addEventListener('click',()=>backTo());
$('complete-button').addEventListener('click',()=>setView('complete'));
$('restart-button').addEventListener('click',()=>backTo());
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.navigation-card nav a').forEach(a=>a.classList.toggle('active',a.hash===`#${entry.target.id}`));}});},{rootMargin:'-10% 0px -60% 0px',threshold:0});
document.querySelectorAll('.section-card').forEach(s=>observer.observe(s));
updateConditions();

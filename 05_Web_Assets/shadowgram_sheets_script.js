// ═══════════════════════════════════════════════════════════════
// Shadowgram — Google Apps Script (Web App)
// 기능 1: 테스트 결과 → Google Sheets 저장
// 기능 2: 이메일 캡처 → Brevo API로 유형별 이메일 자동 발송
//
// 설치 방법:
// 1. Google Sheets → 확장 프로그램 → Apps Script
// 2. 아래 코드 전체 붙여넣기
// 3. 저장(Ctrl+S)
// 4. 배포 → 새 배포 → 웹 앱
//    - 액세스: 모든 사용자 (익명 포함)
//    - 실행: 나 (본인)
// 5. 배포 URL → shadowgram_pt.html의 Google Sheets URL과 동일하게 사용
// ═══════════════════════════════════════════════════════════════

// ★ Brevo API 키 (여기에만 보관 — 프론트엔드에 절대 노출 금지)
// ⚠️ 실제 키는 Apps Script 에디터에 직접 입력 — GitHub에 커밋 금지
const BREVO_API_KEY = 'YOUR_BREVO_API_KEY_HERE';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// 발신자 정보
const FROM_EMAIL = 'noreply@shadowgram.org';
const FROM_NAME  = 'Shadowgram';

// Google Sheets
const SHEET_NAME         = 'Results';
const EMAIL_SHEET_NAME   = 'EmailLeads';

// ★ Hotmart 유형별 구매 링크 (여기서 관리)
const HOTMART_LINKS = {
  SPARK:   'https://go.hotmart.com/J104717194W',
  VISION:  'https://go.hotmart.com/I104717374F',
  STEADY:  'https://go.hotmart.com/E104716942R',
  PLAYER:  'https://go.hotmart.com/I104717428N',
  HARMONY: 'https://go.hotmart.com/I104717484Y',
  SOUL:    'https://go.hotmart.com/U104717553C',
  LOGIC:   'https://go.hotmart.com/U104717592I',
  LEADER:  'https://go.hotmart.com/U104717647A',
};

// ★ PDF 첨부파일 Google Drive 파일 ID (Drive에 업로드 후 ID 입력)
// 파일 URL: https://drive.google.com/file/d/FILE_ID/view
const PDF_DRIVE_IDS = {
  SPARK:   '',  // TODO: Drive File ID 입력
  VISION:  '',
  STEADY:  '',
  PLAYER:  '',
  HARMONY: '',
  SOUL:    '',
  LOGIC:   '',
  LEADER:  '',
};

// 유형별 메타 정보
const TYPE_META = {
  SPARK:   { subtitle: 'O Explorador',   func: 'Ne', mbti: 'ENFP · ENTP', color: '#C2620A' },
  VISION:  { subtitle: 'A Visionária',   func: 'Ni', mbti: 'INFJ · INTJ',  color: '#5B3A8A' },
  STEADY:  { subtitle: 'A Guardiã',      func: 'Si', mbti: 'ISFJ · ISTJ',  color: '#2E6E9E' },
  PLAYER:  { subtitle: 'O Performer',    func: 'Se', mbti: 'ESFP · ESTP', color: '#A0392A' },
  HARMONY: { subtitle: 'A Harmoniosa',   func: 'Fe', mbti: 'ESFJ · ENFJ', color: '#2A7A4A' },
  SOUL:    { subtitle: 'A Alma',          func: 'Fi', mbti: 'INFP · ISFP',  color: '#7A3A9A' },
  LOGIC:   { subtitle: 'O Analista',     func: 'Ti', mbti: 'ISTP · INTP',  color: '#1A6E7A' },
  LEADER:  { subtitle: 'O Comandante',   func: 'Te', mbti: 'ESTJ · ENTJ', color: '#7A5A1A' },
};

// ═══════════════════════════════════════════════════════════════
// doPost — 모든 POST 요청 처리
// event: 'quiz_result' | 'email_capture'
// ═══════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const event = data.event || 'quiz_result';

    if (event === 'email_capture') {
      return handleEmailCapture(data);
    } else {
      return handleQuizResult(data);
    }

  } catch(err) {
    return jsonResponse({status: 'error', msg: err.toString()});
  }
}

// ── 퀴즈 결과 저장 ──
function handleQuizResult(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ['Timestamp','Type','Code','Country','Lang','Duration(s)','SessionID','Revisit','VisitCount','Device','Browser','OS','Ref','UTM_Source','UTM_Medium','UTM_Campaign','UTM_Content','PageURL'];
    sheet.appendRow(headers);
    styleHeader(sheet, headers.length);
  }

  sheet.appendRow([
    data.ts           || new Date().toISOString(),
    data.type         || '',
    data.code         || '',
    data.country      || '',
    data.lang         || '',
    data.duration_sec || '',
    data.session_id   || '',
    data.revisit      || '',
    data.visit_count  || '',
    data.device       || '',
    data.browser      || '',
    data.os           || '',
    data.ref          || 'direct',
    data.utm_source   || '',
    data.utm_medium   || '',
    data.utm_campaign || '',
    data.utm_content  || '',
    data.page_url     || '',
  ]);

  return jsonResponse({status: 'ok'});
}

// ── 이메일 캡처 + Brevo 발송 ──
function handleEmailCapture(data) {
  const email = (data.email || '').trim().toLowerCase();
  const tipo  = (data.tipo  || '').toUpperCase();

  if (!email || !tipo || !TYPE_META[tipo]) {
    return jsonResponse({status: 'error', msg: 'invalid email or tipo'});
  }

  // 1) EmailLeads 시트에 기록
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(EMAIL_SHEET_NAME);
    const headers = ['Timestamp', 'Email', 'Tipo', 'Country', 'Lang', 'UTM_Source', 'UTM_Medium', 'UTM_Campaign', 'LGPD_Consent', 'Consent_TS', 'Sent', 'Error'];
    sheet.appendRow(headers);
    styleHeader(sheet, headers.length);
  }

  // 중복 체크 (같은 이메일 + 같은 유형)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existing = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    for (const row of existing) {
      if (row[1] === email && row[2] === tipo) {
        return jsonResponse({status: 'ok', msg: 'duplicate skipped'});
      }
    }
  }

  // 2) Brevo로 이메일 발송 (PDF 첨부)
  let sent = false;
  let errMsg = '';
  try {
    const meta     = TYPE_META[tipo];
    const emailHtml = buildEmailHtml(tipo, meta);

    const payload = {
      sender:  { name: FROM_NAME, email: FROM_EMAIL },
      to:      [{ email: email }],
      subject: `Seu tipo Shadowgram é ${tipo} — ${meta.subtitle} · Relatório Gratuito`,
      htmlContent: emailHtml,
    };

    // PDF 첨부: Google Drive에서 base64로 로드
    const driveId = PDF_DRIVE_IDS[tipo];
    if (driveId) {
      try {
        const file = DriveApp.getFileById(driveId);
        const pdfBytes = file.getBlob().getBytes();
        const pdfBase64 = Utilities.base64Encode(pdfBytes);
        payload.attachment = [{
          name:    'Shadowgram_' + tipo + '_Free.pdf',
          content: pdfBase64,
        }];
      } catch(attachErr) {
        // Drive 접근 실패 시 첨부 없이 발송 계속
        Logger.log('PDF attach error: ' + attachErr.toString());
      }
    }

    const response = UrlFetchApp.fetch(BREVO_API_URL, {
      method:      'post',
      contentType: 'application/json',
      headers:     { 'api-key': BREVO_API_KEY },
      payload:     JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const code = response.getResponseCode();
    sent = (code === 201 || code === 200);
    if (!sent) errMsg = response.getContentText().substring(0, 200);

  } catch(err) {
    errMsg = err.toString();
  }

  // 3) 결과 기록
  sheet.appendRow([
    new Date().toISOString(),
    email,
    tipo,
    data.country      || '',
    data.lang         || '',
    data.utm_source   || '',
    data.utm_medium   || '',
    data.utm_campaign || '',
    data.lgpd_consent ? 'YES' : 'NO',
    data.consent_ts   || '',
    sent ? 'YES' : 'NO',
    errMsg,
  ]);

  return jsonResponse({status: sent ? 'ok' : 'error', sent, error: errMsg});
}

// ═══════════════════════════════════════════════════════════════
// 이메일 HTML 빌드 (인라인 — Apps Script 내부에서 생성)
// ═══════════════════════════════════════════════════════════════
function buildEmailHtml(tipo, meta) {
  const color = meta.color;

  const TYPE_CONTENT = {
    SPARK:   { hero: 'Sua mente nunca para — e isso é seu maior poder.', luz: 'Você enxerga possibilidades onde outros veem paredes. Sua função dominante Ne conecta ideias de formas que surpreendem até você mesmo. Isso te torna magnético, criativo e capaz de transformar qualquer ambiente com energia nova.', sombra: 'A sombra do SPARK é Si — o mundo da rotina, da consistência. Quando ignorada, manifesta-se como dificuldade de terminar o que começou, ansiedade disfarçada de entusiasmo, e uma sensação permanente de que "algo melhor está vindo."' },
    VISION:  { hero: 'Você enxerga o que os outros ainda não viram.', luz: 'Sua função dominante Ni funciona como um radar de padrões profundos. Você não apenas analisa — percebe o que está por vir antes que aconteça. Essa clareza interna é rara e poderosa.', sombra: 'A sombra VISION é Se — o presente, o corpo, o mundo físico. Quando ignorada, manifesta-se como paralisia pela análise, isolamento, e a sensação de que ninguém entende sua profundidade.' },
    STEADY:  { hero: 'Sua força está em nunca deixar ninguém para trás.', luz: 'Sua função dominante Si é o guardião da memória, da tradição e da confiabilidade. Você constrói com cuidado, honra compromissos e cria ambientes onde as pessoas se sentem seguras.', sombra: 'A sombra STEADY é Ne — o novo, o desconhecido, a mudança. Quando ignorada, aparece como resistência ao novo, ansiedade diante de incertezas, e uma rigidez que protege mas também aprisiona.' },
    PLAYER:  { hero: 'Você não espera o momento — você cria o momento.', luz: 'Sua função dominante Se te coloca completamente no aqui e agora. Você lê ambientes, adapta rapidamente, age quando outros ainda estão pensando. Sua presença física e energia são magnéticas.', sombra: 'A sombra PLAYER é Ni — o longo prazo, o significado profundo. Quando ignorada, aparece como impulsividade, dificuldade com comprometimento, e uma inquietação que nenhuma experiência consegue acalmar.' },
    HARMONY: { hero: 'Você sente o que todos sentem — ainda antes de falarem.', luz: 'Sua função dominante Fe é uma antena de harmonia social. Você percebe o clima emocional de qualquer grupo antes de uma palavra ser dita. Essa capacidade de conectar e criar pertencimento é extraordinária.', sombra: 'A sombra HARMONY é Ti — análise fria, lógica individual, limites claros. Quando ignorada, aparece como dificuldade de dizer não e um esgotamento silencioso que ninguém vê.' },
    SOUL:    { hero: 'Sua sensibilidade não é fraqueza — é sua bússola mais precisa.', luz: 'Sua função dominante Fi é uma bússola interna de valores profundos. Você não age por aprovação — age por integridade. Essa autenticidade rara toca pessoas de formas que lógica e estratégia nunca conseguem.', sombra: 'A sombra SOUL é Te — resultados mensuráveis, eficiência, estrutura. Quando ignorada, aparece como sensação de invisibilidade e a dor de sentir muito sem saber o que fazer com isso.' },
    LOGIC:   { hero: 'Você não aceita respostas prontas — precisa entender por dentro.', luz: 'Sua função dominante Ti é um motor de precisão interna. Você não aceita explicações vagas — precisa entender o mecanismo por dentro. Essa capacidade analítica profunda resolve problemas que outros nem conseguem formular.', sombra: 'A sombra LOGIC é Fe — empatia, conexão emocional, harmonia social. Quando ignorada, aparece como dificuldade de se conectar emocionalmente e uma solidão que a lógica não consegue resolver.' },
    LEADER:  { hero: 'Você não espera permissão — você constrói o caminho.', luz: 'Sua função dominante Te é uma máquina de resultados. Você vê o objetivo, organiza os recursos e executa — enquanto outros ainda estão debatendo. Essa capacidade de transformar visão em ação é liderança real.', sombra: 'A sombra LEADER é Fi — valores pessoais profundos, autenticidade emocional. Quando ignorada, aparece como vazio após conquistas e uma pergunta silenciosa: "Para quem estou construindo tudo isso?"' },
  };

  const c = TYPE_CONTENT[tipo] || TYPE_CONTENT['SPARK'];

  return '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>'
    + '<body style="margin:0;padding:0;background:#0D1118;font-family:Helvetica Neue,Arial,sans-serif;color:#ffffff;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1118;"><tr><td align="center" style="padding:32px 16px;">'
    + '<table width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">'

    // HEADER
    + '<tr><td style="background:linear-gradient(135deg,' + color + ' 0%,#0D1118 65%);border-radius:10px 10px 0 0;padding:40px 32px;text-align:center;border-bottom:2px solid ' + color + ';">'
    + '<div style="font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.5);margin-bottom:14px;">SHADOWGRAM SELF</div>'
    + '<div style="font-size:60px;font-weight:900;letter-spacing:4px;color:#fff;line-height:1;margin-bottom:8px;">' + tipo + '</div>'
    + '<div style="font-size:16px;color:#E8D4A8;font-weight:600;margin-bottom:4px;">' + meta.subtitle + '</div>'
    + '<div style="font-size:12px;color:rgba(255,255,255,0.45);letter-spacing:1px;">' + meta.func + ' · ' + meta.mbti + '</div>'
    + '<div style="margin-top:20px;font-size:17px;color:#fff;font-style:italic;line-height:1.5;">"' + c.hero + '"</div>'
    + '</td></tr>'

    // INTRO
    + '<tr><td style="background:#0F1520;padding:28px 32px;border-left:1px solid #1E2A3A;border-right:1px solid #1E2A3A;">'
    + '<p style="font-size:15px;color:#9BAAB8;line-height:1.8;margin:0 0 12px;">Olá,</p>'
    + '<p style="font-size:15px;color:#9BAAB8;line-height:1.8;margin:0 0 12px;">Você descobriu que é tipo <strong style="color:#E8D4A8;">' + tipo + ' — ' + meta.subtitle + '</strong> no diagnóstico Shadowgram.</p>'
    + '<p style="font-size:15px;color:#9BAAB8;line-height:1.8;margin:0;">Este relatório é seu primeiro mapa — uma introdução à sua <strong style="color:#fff;">Luz</strong> e à sua <strong style="color:#E8D4A8;">Sombra</strong>.</p>'
    + '</td></tr>'

    // O QUE É SHADOWGRAM
    + '<tr><td style="background:#111827;padding:24px 32px;border-left:1px solid #1E2A3A;border-right:1px solid #1E2A3A;border-top:1px solid #1E2A3A;">'
    + '<div style="font-size:10px;letter-spacing:3px;color:#B8860B;font-weight:700;margin-bottom:12px;">O QUE É SHADOWGRAM</div>'
    + '<p style="font-size:14px;color:#9BAAB8;line-height:1.9;margin:0 0 12px;">Shadowgram é um framework de desenvolvimento humano baseado na teoria de <strong style="color:#fff;">Carl Jung</strong> e no Big Five — mas com foco no que a maioria ignora:</p>'
    + '<div style="background:rgba(184,134,11,0.08);border-left:3px solid #B8860B;padding:14px 18px;border-radius:0 6px 6px 0;">'
    + '<p style="font-size:14px;color:#E8D4A8;line-height:1.7;margin:0;font-style:italic;">"Não basta conhecer seus pontos fortes. É preciso integrar sua sombra — o que você evita, nega e projeta nos outros."</p>'
    + '</div></td></tr>'

    // LUZ
    + '<tr><td style="background:#0F1520;padding:24px 32px;border-left:1px solid #1E2A3A;border-right:1px solid #1E2A3A;border-top:2px solid ' + color + ';">'
    + '<div style="font-size:10px;letter-spacing:3px;color:#E8D4A8;font-weight:700;margin-bottom:12px;">✦ SUA LUZ — FUNÇÃO DOMINANTE</div>'
    + '<p style="font-size:14px;color:#9BAAB8;line-height:1.9;margin:0;">' + c.luz + '</p>'
    + '</td></tr>'

    // SOMBRA
    + '<tr><td style="background:#0F1520;padding:24px 32px;border-left:1px solid #1E2A3A;border-right:1px solid #1E2A3A;border-top:1px solid #1E2A3A;">'
    + '<div style="font-size:10px;letter-spacing:3px;color:#9BAAB8;font-weight:700;margin-bottom:12px;">◆ SUA SOMBRA — FUNÇÃO INFERIOR</div>'
    + '<p style="font-size:14px;color:#9BAAB8;line-height:1.9;margin:0;">' + c.sombra + '</p>'
    + '</td></tr>'

    // O PRÓXIMO PASSO
    + '<tr><td style="background:#111827;padding:28px 32px;border-left:1px solid #1E2A3A;border-right:1px solid #1E2A3A;border-top:1px solid #1E2A3A;">'
    + '<div style="font-size:10px;letter-spacing:3px;color:#B8860B;font-weight:700;margin-bottom:12px;">O PRÓXIMO PASSO</div>'
    + '<p style="font-size:14px;color:#9BAAB8;line-height:1.9;margin:0 0 12px;">Este relatório é sua porta de entrada. Ele mostra o que está acontecendo.</p>'
    + '<p style="font-size:14px;color:#9BAAB8;line-height:1.9;margin:0;">O <strong style="color:#fff;">Relatório Completo</strong> mostra como mudar — com 6 módulos aprofundados, exercícios práticos e protocolos de ação para cada fase da sua vida.</p>'
    + '</td></tr>'

    // FOOTER
    + '<tr><td style="background:#0A0E16;padding:24px 32px;border-radius:0 0 10px 10px;border:1px solid #1E2A3A;border-top:none;text-align:center;">'
    + '<div style="margin-bottom:10px;"><span style="font-size:12px;letter-spacing:3px;color:#9BAAB8;font-weight:300;">SHADOW</span><span style="font-size:12px;letter-spacing:3px;color:#fff;font-weight:900;">GRAM</span></div>'
    + '<p style="font-size:11px;color:rgba(155,170,184,0.4);line-height:2;margin:0;">'
    + '<a href="https://shadowgram.org" style="color:#B8860B;text-decoration:none;">shadowgram.org</a><br>'
    + 'Diagnóstico baseado em Jung (1921) e IPIP Big Five (domínio público).<br>'
    + 'Não afiliado à The Myers &amp; Briggs Foundation.<br><br>'
    + '<a href="{{unsubscribe}}" style="color:rgba(155,170,184,0.3);text-decoration:none;font-size:11px;">Cancelar inscrição</a>'
    + '</p></td></tr>'

    + '</table></td></tr></table></body></html>';
}

// ═══════════════════════════════════════════════════════════════
// 유틸리티
// ═══════════════════════════════════════════════════════════════
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function styleHeader(sheet, colCount) {
  const header = sheet.getRange(1, 1, 1, colCount);
  header.setFontWeight('bold');
  header.setBackground('#0F1520');
  header.setFontColor('#B8860B');
}

// 테스트용 GET
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const emailSheet = ss.getSheetByName(EMAIL_SHEET_NAME);
  const count = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  const leads = emailSheet ? Math.max(0, emailSheet.getLastRow() - 1) : 0;
  return jsonResponse({status: 'ok', total_results: count, total_email_leads: leads});
}

// ═══════════════════════════════════════════════════════════════
// buildAnalyticsSheet — 수동 실행: Apps Script 에디터에서 직접 호출
// 분석 시트를 생성/갱신: 유형별·국가별·UTM·전환율 집계
// ═══════════════════════════════════════════════════════════════
function buildAnalyticsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resultSheet = ss.getSheetByName(SHEET_NAME);
  const emailSheet  = ss.getSheetByName(EMAIL_SHEET_NAME);

  // Analytics 시트 초기화
  let aSheet = ss.getSheetByName('Analytics');
  if (aSheet) aSheet.clearContents();
  else aSheet = ss.insertSheet('Analytics');

  if (!resultSheet || resultSheet.getLastRow() < 2) {
    aSheet.getRange('A1').setValue('데이터 없음');
    return;
  }

  // ── Results 원본 읽기 (Timestamp,Type,Code,Country,Lang,Duration,SessionID,Revisit,VisitCount,Device,Browser,OS,Ref,UTM_Source,UTM_Medium,UTM_Campaign,UTM_Content,PageURL)
  const rData = resultSheet.getRange(2, 1, resultSheet.getLastRow() - 1, 18).getValues();

  // ── EmailLeads 원본 읽기 (Timestamp,Email,Tipo,Country,Lang,UTM_Source,UTM_Medium,UTM_Campaign,LGPD_Consent,Consent_TS,Sent,Error)
  let eData = [];
  if (emailSheet && emailSheet.getLastRow() > 1) {
    eData = emailSheet.getRange(2, 1, emailSheet.getLastRow() - 1, 12).getValues();
  }

  const totalQuiz  = rData.length;
  const totalEmail = eData.length;
  const convRate   = totalQuiz > 0 ? (totalEmail / totalQuiz * 100).toFixed(1) + '%' : '0%';

  // 집계 헬퍼
  function countBy(arr, keyFn) {
    const map = {};
    arr.forEach(row => {
      const k = keyFn(row) || '(unknown)';
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  // 집계
  const byType    = countBy(rData, r => r[1]);          // Type (col B)
  const byCountry = countBy(rData, r => r[3]);          // Country (col D)
  const byDevice  = countBy(rData, r => r[9]);          // Device (col J)
  const byUTM     = countBy(rData, r => r[13] || 'organic'); // UTM_Source (col N)
  const emailByType    = countBy(eData, r => r[2]);     // Tipo (col C)
  const emailByCountry = countBy(eData, r => r[3]);     // Country (col D)

  // 전환율 by type
  const typeConv = byType.map(([t, quizN]) => {
    const emailN = (emailByType.find(([et]) => et === t) || [t, 0])[1];
    return [t, quizN, emailN, quizN > 0 ? (emailN / quizN * 100).toFixed(1) + '%' : '0%'];
  });

  // ── 시트에 출력
  let row = 1;
  function writeSection(title, headers, rows) {
    aSheet.getRange(row, 1).setValue('▶ ' + title)
      .setFontWeight('bold').setBackground('#1A2030').setFontColor('#B8860B');
    row++;
    aSheet.getRange(row, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#0F1520').setFontColor('#8899AA');
    row++;
    if (rows.length > 0) {
      aSheet.getRange(row, 1, rows.length, rows[0].length).setValues(rows);
      row += rows.length;
    }
    row += 2;
  }

  // 요약
  aSheet.getRange(row, 1).setValue('📊 SHADOWGRAM ANALYTICS').setFontSize(14).setFontWeight('bold').setFontColor('#B8860B');
  row++;
  aSheet.getRange(row, 1, 3, 2).setValues([
    ['총 퀴즈 완료', totalQuiz],
    ['이메일 리드', totalEmail],
    ['전환율 (퀴즈→이메일)', convRate],
  ]);
  row += 5;

  writeSection('유형별 퀴즈 분포 & 전환율',
    ['유형', '퀴즈 수', '이메일 수', '전환율'],
    typeConv);

  writeSection('국가별 퀴즈 분포',
    ['국가', '퀴즈 수'],
    byType.length > 0 ? byCountry : []);

  writeSection('국가별 이메일 리드',
    ['국가', '이메일 수'],
    emailByCountry);

  writeSection('디바이스별 분포',
    ['디바이스', '수'],
    byDevice);

  writeSection('UTM 소스별 유입',
    ['UTM Source', '수'],
    byUTM);

  // 열 너비 자동 조정
  aSheet.autoResizeColumns(1, 5);

  SpreadsheetApp.getUi().alert('Analytics 시트가 업데이트되었습니다!');
}

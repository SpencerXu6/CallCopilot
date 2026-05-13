export interface LangStrings {
  heroTitle: string;
  heroSub: string;
  myLanguage: string;
  goalTitle: string;
  goalSub: string;
  goalPlaceholder: string;
  commonTasks: string;
  ready: string;
  startCall: string;
  tip: string;
  signOutTitle: string;
  signOutMessage: string;
  signOutConfirm: string;
  cancel: string;
  presets: string[];
}

export const UI: Record<string, LangStrings> = {
  Chinese: {
    heroTitle: '打好每一个\n英文电话',
    heroSub: '输入通话目标，AI 实时翻译并提供回复建议',
    myLanguage: '我的语言',
    goalTitle: '您想完成什么？',
    goalSub: '这次通话您需要什么帮助？',
    goalPlaceholder: '例如：我想对账单上的错误收费提出异议…',
    commonTasks: '常见任务',
    ready: '准备好了？',
    startCall: '开始通话 / Start Call',
    tip: '💡 通话时将手机置于免提模式效果更佳',
    signOutTitle: '退出登录',
    signOutMessage: '确定要退出登录吗？',
    signOutConfirm: '退出',
    cancel: '取消',
    presets: ['账单错误收费申诉', '网络断了好几天，急需修复', '重新预约医生', '取消订阅并申请退款', '挂失卡片并补办新卡', '要求转接上级主管'],
  },
  Spanish: {
    heroTitle: 'Domina cada\nllamada en inglés',
    heroSub: 'Ingresa tu objetivo y recibe traducción en tiempo real con sugerencias de respuesta',
    myLanguage: 'Mi idioma',
    goalTitle: '¿Qué quieres lograr?',
    goalSub: '¿Con qué necesitas ayuda en esta llamada?',
    goalPlaceholder: 'Ej: Quiero disputar un cobro incorrecto en mi factura…',
    commonTasks: 'Tareas comunes',
    ready: '¿Listo?',
    startCall: 'Iniciar llamada / Start Call',
    tip: '💡 Pon el teléfono en altavoz para mejores resultados',
    signOutTitle: 'Cerrar sesión',
    signOutMessage: '¿Seguro que quieres cerrar sesión?',
    signOutConfirm: 'Cerrar sesión',
    cancel: 'Cancelar',
    presets: ['Disputar cargo incorrecto', 'Internet sin servicio, reparación urgente', 'Reprogramar cita médica', 'Cancelar suscripción y reembolso', 'Reportar tarjeta perdida', 'Hablar con un supervisor'],
  },
  French: {
    heroTitle: 'Maîtrisez chaque\nappel en anglais',
    heroSub: 'Entrez votre objectif et recevez une traduction en temps réel avec des suggestions de réponse',
    myLanguage: 'Ma langue',
    goalTitle: 'Que voulez-vous accomplir ?',
    goalSub: 'De quoi avez-vous besoin pour cet appel ?',
    goalPlaceholder: 'Ex: Je veux contester un débit incorrect sur ma facture…',
    commonTasks: 'Tâches courantes',
    ready: 'Prêt ?',
    startCall: 'Démarrer l\'appel / Start Call',
    tip: '💡 Mettez votre téléphone sur haut-parleur pour de meilleurs résultats',
    signOutTitle: 'Déconnexion',
    signOutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    signOutConfirm: 'Se déconnecter',
    cancel: 'Annuler',
    presets: ['Contester un débit incorrect', 'Internet en panne depuis des jours', 'Reporter un rendez-vous médical', 'Annuler abonnement et remboursement', 'Signaler une carte perdue', 'Parler à un superviseur'],
  },
  Korean: {
    heroTitle: '모든 영어 통화를\n자신 있게',
    heroSub: '통화 목표를 입력하면 AI가 실시간으로 번역하고 답변을 제안해 드립니다',
    myLanguage: '내 언어',
    goalTitle: '무엇을 하고 싶으신가요?',
    goalSub: '이번 통화에서 어떤 도움이 필요하신가요?',
    goalPlaceholder: '예: 청구서에 잘못 청구된 금액에 이의를 제기하고 싶습니다…',
    commonTasks: '일반적인 업무',
    ready: '준비되셨나요?',
    startCall: '통화 시작 / Start Call',
    tip: '💡 더 나은 결과를 위해 스피커폰 모드를 사용하세요',
    signOutTitle: '로그아웃',
    signOutMessage: '정말 로그아웃하시겠습니까?',
    signOutConfirm: '로그아웃',
    cancel: '취소',
    presets: ['청구서 오류 이의 제기', '인터넷 며칠째 불통, 긴급 수리', '진료 예약 변경', '구독 취소 및 환불', '분실 카드 신고 및 재발급', '상위 책임자 연결 요청'],
  },
  Japanese: {
    heroTitle: '英語の電話を\n自信を持って',
    heroSub: '通話の目標を入力すると、AIがリアルタイムで翻訳し、返答を提案します',
    myLanguage: '使用言語',
    goalTitle: '何をしたいですか？',
    goalSub: 'この通話で何のサポートが必要ですか？',
    goalPlaceholder: '例：請求書に誤った請求があり、異議を申し立てたい…',
    commonTasks: 'よくある用件',
    ready: '準備はいいですか？',
    startCall: '通話を開始 / Start Call',
    tip: '💡 より良い結果のため、スピーカーモードをお使いください',
    signOutTitle: 'ログアウト',
    signOutMessage: 'ログアウトしてもよろしいですか？',
    signOutConfirm: 'ログアウト',
    cancel: 'キャンセル',
    presets: ['請求の誤りに異議申し立て', 'ネットが数日止まり、緊急修理', '診察予約の変更', 'サブスク解約・返金申請', '紛失カードの届出と再発行', '上位担当者への引継ぎ要請'],
  },
  Portuguese: {
    heroTitle: 'Domine cada\nligação em inglês',
    heroSub: 'Digite seu objetivo e receba tradução em tempo real com sugestões de resposta',
    myLanguage: 'Meu idioma',
    goalTitle: 'O que você quer realizar?',
    goalSub: 'Com o que precisa de ajuda nesta ligação?',
    goalPlaceholder: 'Ex: Quero contestar uma cobrança incorreta na minha fatura…',
    commonTasks: 'Tarefas comuns',
    ready: 'Pronto?',
    startCall: 'Iniciar ligação / Start Call',
    tip: '💡 Use o viva-voz para melhores resultados',
    signOutTitle: 'Sair',
    signOutMessage: 'Tem certeza que deseja sair?',
    signOutConfirm: 'Sair',
    cancel: 'Cancelar',
    presets: ['Contestar cobrança incorreta', 'Internet sem serviço há dias', 'Remarcar consulta médica', 'Cancelar assinatura e reembolso', 'Reportar cartão perdido', 'Falar com supervisor'],
  },
  Vietnamese: {
    heroTitle: 'Tự tin với mọi\ncuộc gọi tiếng Anh',
    heroSub: 'Nhập mục tiêu của bạn, AI sẽ dịch theo thời gian thực và gợi ý câu trả lời',
    myLanguage: 'Ngôn ngữ của tôi',
    goalTitle: 'Bạn muốn làm gì?',
    goalSub: 'Bạn cần hỗ trợ gì trong cuộc gọi này?',
    goalPlaceholder: 'Ví dụ: Tôi muốn khiếu nại khoản phí sai trên hóa đơn…',
    commonTasks: 'Việc thường gặp',
    ready: 'Sẵn sàng chưa?',
    startCall: 'Bắt đầu gọi / Start Call',
    tip: '💡 Bật loa ngoài để có kết quả tốt hơn',
    signOutTitle: 'Đăng xuất',
    signOutMessage: 'Bạn có chắc muốn đăng xuất không?',
    signOutConfirm: 'Đăng xuất',
    cancel: 'Hủy',
    presets: ['Khiếu nại khoản phí sai', 'Internet mất mấy ngày, cần sửa gấp', 'Đặt lại lịch khám bác sĩ', 'Hủy đăng ký và hoàn tiền', 'Báo mất thẻ và xin cấp lại', 'Yêu cầu chuyển lên quản lý'],
  },
  Hindi: {
    heroTitle: 'हर अंग्रेज़ी कॉल को\nआत्मविश्वास से करें',
    heroSub: 'अपना लक्ष्य दर्ज करें, AI रियल-टाइम में अनुवाद और जवाब सुझाएगा',
    myLanguage: 'मेरी भाषा',
    goalTitle: 'आप क्या करना चाहते हैं?',
    goalSub: 'इस कॉल में आपको किस चीज़ में मदद चाहिए?',
    goalPlaceholder: 'जैसे: मैं अपने बिल पर गलत चार्ज का विरोध करना चाहता हूं…',
    commonTasks: 'सामान्य काम',
    ready: 'तैयार हैं?',
    startCall: 'कॉल शुरू करें / Start Call',
    tip: '💡 बेहतर परिणाम के लिए स्पीकर मोड का उपयोग करें',
    signOutTitle: 'साइन आउट',
    signOutMessage: 'क्या आप वाकई साइन आउट करना चाहते हैं?',
    signOutConfirm: 'साइन आउट',
    cancel: 'रद्द करें',
    presets: ['बिल में गलत चार्ज की शिकायत', 'इंटरनेट कई दिनों से बंद, तुरंत ठीक करें', 'डॉक्टर की अपॉइंटमेंट बदलें', 'सदस्यता रद्द करें और रिफंड लें', 'खोया हुआ कार्ड रिपोर्ट करें', 'सुपरवाइज़र से बात करें'],
  },
};

export const PRESET_EN = [
  'I want to dispute an incorrect charge on my bill.',
  'My internet has been out for days — I need it fixed urgently.',
  'I need to reschedule my upcoming doctor appointment.',
  'I want to cancel my subscription and request a full refund.',
  'I need to report a lost card and order a replacement.',
  'I want to escalate my issue and speak to a supervisor.',
];

export function t(language: string): LangStrings {
  return UI[language] ?? UI['Chinese'];
}

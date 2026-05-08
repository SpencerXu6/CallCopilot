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
    goalPlaceholder: '例如：我想把垃圾桶从大号换成小号...',
    commonTasks: '常见任务',
    ready: '准备好了？',
    startCall: '开始通话 / Start Call',
    tip: '💡 通话时将手机置于免提模式效果更佳',
    signOutTitle: '退出登录',
    signOutMessage: '确定要退出登录吗？',
    signOutConfirm: '退出',
    cancel: '取消',
    presets: ['更改垃圾桶大小', '银行账户问题', '预约医生', '账单问题', '更改地址', '取消服务'],
  },
  Spanish: {
    heroTitle: 'Domina cada\nllamada en inglés',
    heroSub: 'Ingresa tu objetivo y recibe traducción en tiempo real con sugerencias de respuesta',
    myLanguage: 'Mi idioma',
    goalTitle: '¿Qué quieres lograr?',
    goalSub: '¿Con qué necesitas ayuda en esta llamada?',
    goalPlaceholder: 'Ej: Quiero cancelar mi servicio...',
    commonTasks: 'Tareas comunes',
    ready: '¿Listo?',
    startCall: 'Iniciar llamada / Start Call',
    tip: '💡 Pon el teléfono en altavoz para mejores resultados',
    signOutTitle: 'Cerrar sesión',
    signOutMessage: '¿Seguro que quieres cerrar sesión?',
    signOutConfirm: 'Cerrar sesión',
    cancel: 'Cancelar',
    presets: ['Cambiar el bote de basura', 'Cuenta bancaria', 'Cita médica', 'Problema de factura', 'Cambiar dirección', 'Cancelar servicio'],
  },
  French: {
    heroTitle: 'Maîtrisez chaque\nappel en anglais',
    heroSub: 'Entrez votre objectif et recevez une traduction en temps réel avec des suggestions de réponse',
    myLanguage: 'Ma langue',
    goalTitle: 'Que voulez-vous accomplir ?',
    goalSub: 'De quoi avez-vous besoin pour cet appel ?',
    goalPlaceholder: 'Ex: Je veux annuler mon abonnement...',
    commonTasks: 'Tâches courantes',
    ready: 'Prêt ?',
    startCall: 'Démarrer l\'appel / Start Call',
    tip: '💡 Mettez votre téléphone sur haut-parleur pour de meilleurs résultats',
    signOutTitle: 'Déconnexion',
    signOutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    signOutConfirm: 'Se déconnecter',
    cancel: 'Annuler',
    presets: ['Changer de poubelle', 'Compte bancaire', 'Rendez-vous médecin', 'Problème de facture', 'Changer d\'adresse', 'Annuler le service'],
  },
  Korean: {
    heroTitle: '모든 영어 통화를\n자신 있게',
    heroSub: '통화 목표를 입력하면 AI가 실시간으로 번역하고 답변을 제안해 드립니다',
    myLanguage: '내 언어',
    goalTitle: '무엇을 하고 싶으신가요?',
    goalSub: '이번 통화에서 어떤 도움이 필요하신가요?',
    goalPlaceholder: '예: 쓰레기통 크기를 변경하고 싶습니다...',
    commonTasks: '일반적인 업무',
    ready: '준비되셨나요?',
    startCall: '통화 시작 / Start Call',
    tip: '💡 더 나은 결과를 위해 스피커폰 모드를 사용하세요',
    signOutTitle: '로그아웃',
    signOutMessage: '정말 로그아웃하시겠습니까?',
    signOutConfirm: '로그아웃',
    cancel: '취소',
    presets: ['쓰레기통 변경', '은행 계좌 문제', '의사 예약', '청구서 문제', '주소 변경', '서비스 취소'],
  },
  Japanese: {
    heroTitle: '英語の電話を\n自信を持って',
    heroSub: '通話の目標を入力すると、AIがリアルタイムで翻訳し、返答を提案します',
    myLanguage: '使用言語',
    goalTitle: '何をしたいですか？',
    goalSub: 'この通話で何のサポートが必要ですか？',
    goalPlaceholder: '例：ゴミ箱のサイズを変えたい...',
    commonTasks: 'よくある用件',
    ready: '準備はいいですか？',
    startCall: '通話を開始 / Start Call',
    tip: '💡 より良い結果のため、スピーカーモードをお使いください',
    signOutTitle: 'ログアウト',
    signOutMessage: 'ログアウトしてもよろしいですか？',
    signOutConfirm: 'ログアウト',
    cancel: 'キャンセル',
    presets: ['ゴミ箱の変更', '銀行口座の問題', '医師の予約', '請求書の問題', '住所変更', 'サービス解約'],
  },
  Portuguese: {
    heroTitle: 'Domine cada\nligação em inglês',
    heroSub: 'Digite seu objetivo e receba tradução em tempo real com sugestões de resposta',
    myLanguage: 'Meu idioma',
    goalTitle: 'O que você quer realizar?',
    goalSub: 'Com o que precisa de ajuda nesta ligação?',
    goalPlaceholder: 'Ex: Quero cancelar meu serviço...',
    commonTasks: 'Tarefas comuns',
    ready: 'Pronto?',
    startCall: 'Iniciar ligação / Start Call',
    tip: '💡 Use o viva-voz para melhores resultados',
    signOutTitle: 'Sair',
    signOutMessage: 'Tem certeza que deseja sair?',
    signOutConfirm: 'Sair',
    cancel: 'Cancelar',
    presets: ['Trocar lixeira', 'Conta bancária', 'Consulta médica', 'Problema de conta', 'Mudar endereço', 'Cancelar serviço'],
  },
  Vietnamese: {
    heroTitle: 'Tự tin với mọi\ncuộc gọi tiếng Anh',
    heroSub: 'Nhập mục tiêu của bạn, AI sẽ dịch theo thời gian thực và gợi ý câu trả lời',
    myLanguage: 'Ngôn ngữ của tôi',
    goalTitle: 'Bạn muốn làm gì?',
    goalSub: 'Bạn cần hỗ trợ gì trong cuộc gọi này?',
    goalPlaceholder: 'Ví dụ: Tôi muốn hủy dịch vụ...',
    commonTasks: 'Việc thường gặp',
    ready: 'Sẵn sàng chưa?',
    startCall: 'Bắt đầu gọi / Start Call',
    tip: '💡 Bật loa ngoài để có kết quả tốt hơn',
    signOutTitle: 'Đăng xuất',
    signOutMessage: 'Bạn có chắc muốn đăng xuất không?',
    signOutConfirm: 'Đăng xuất',
    cancel: 'Hủy',
    presets: ['Đổi thùng rác', 'Tài khoản ngân hàng', 'Đặt lịch bác sĩ', 'Vấn đề hóa đơn', 'Thay đổi địa chỉ', 'Hủy dịch vụ'],
  },
  Hindi: {
    heroTitle: 'हर अंग्रेज़ी कॉल को\nआत्मविश्वास से करें',
    heroSub: 'अपना लक्ष्य दर्ज करें, AI रियल-टाइम में अनुवाद और जवाब सुझाएगा',
    myLanguage: 'मेरी भाषा',
    goalTitle: 'आप क्या करना चाहते हैं?',
    goalSub: 'इस कॉल में आपको किस चीज़ में मदद चाहिए?',
    goalPlaceholder: 'जैसे: मैं अपनी सेवा रद्द करना चाहता हूं...',
    commonTasks: 'सामान्य काम',
    ready: 'तैयार हैं?',
    startCall: 'कॉल शुरू करें / Start Call',
    tip: '💡 बेहतर परिणाम के लिए स्पीकर मोड का उपयोग करें',
    signOutTitle: 'साइन आउट',
    signOutMessage: 'क्या आप वाकई साइन आउट करना चाहते हैं?',
    signOutConfirm: 'साइन आउट',
    cancel: 'रद्द करें',
    presets: ['कूड़ेदान बदलें', 'बैंक खाता समस्या', 'डॉक्टर अपॉइंटमेंट', 'बिल समस्या', 'पता बदलें', 'सेवा रद्द करें'],
  },
};

export const PRESET_EN = [
  'I want to change my garbage bin size.',
  'I have a question about my bank account.',
  'I want to schedule a doctor appointment.',
  'I have a question about my bill.',
  'I need to update my address.',
  'I want to cancel my service.',
];

export function t(language: string): LangStrings {
  return UI[language] ?? UI['Chinese'];
}

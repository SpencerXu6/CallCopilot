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

export interface PresetEntry {
  en: string;
  [lang: string]: string;
}

export const PRESETS_BY_USE_CASE: Record<string, PresetEntry[]> = {
  'Healthcare': [
    { en: 'I need to reschedule my upcoming doctor appointment.', Chinese: '重新预约医生门诊', Spanish: 'Reprogramar cita médica', French: 'Reporter un rendez-vous médical', Korean: '진료 예약 변경', Japanese: '診察予約の変更', Portuguese: 'Remarcar consulta médica', Vietnamese: 'Đặt lại lịch khám bác sĩ', Hindi: 'डॉक्टर की अपॉइंटमेंट बदलें' },
    { en: 'I want to verify my insurance coverage for this procedure.', Chinese: '确认保险是否覆盖此项手术', Spanish: 'Verificar cobertura del seguro para este procedimiento', French: 'Vérifier la couverture d\'assurance pour cette procédure', Korean: '이 시술의 보험 적용 여부 확인', Japanese: 'この処置の保険適用を確認したい', Portuguese: 'Verificar cobertura do seguro para este procedimento', Vietnamese: 'Kiểm tra bảo hiểm có chi trả thủ thuật này không', Hindi: 'इस प्रक्रिया के लिए बीमा कवरेज जांचें' },
    { en: 'I need to request a referral to a specialist.', Chinese: '申请转诊专科医生', Spanish: 'Solicitar derivación a un especialista', French: 'Demander une référence à un spécialiste', Korean: '전문의 의뢰서 요청', Japanese: '専門医への紹介状を依頼したい', Portuguese: 'Solicitar encaminhamento a um especialista', Vietnamese: 'Xin giấy giới thiệu đến bác sĩ chuyên khoa', Hindi: 'विशेषज्ञ के लिए रेफरल माँगें' },
    { en: 'I want to check the status of a prior authorization.', Chinese: '查询预授权申请状态', Spanish: 'Consultar el estado de una autorización previa', French: 'Vérifier le statut d\'une autorisation préalable', Korean: '사전 승인 상태 확인', Japanese: '事前承認の状況を確認したい', Portuguese: 'Verificar status de autorização prévia', Vietnamese: 'Kiểm tra tình trạng phê duyệt trước', Hindi: 'पूर्व प्राधिकरण की स्थिति जांचें' },
    { en: 'I need to ask about the cost of a procedure before my visit.', Chinese: '就诊前询问手术费用', Spanish: 'Preguntar el costo de un procedimiento antes de la cita', French: 'Me renseigner sur le coût d\'une procédure avant ma visite', Korean: '방문 전 시술 비용 문의', Japanese: '受診前に処置の費用を確認したい', Portuguese: 'Perguntar custo de procedimento antes da consulta', Vietnamese: 'Hỏi chi phí thủ thuật trước khi đến khám', Hindi: 'मुलाकात से पहले प्रक्रिया की लागत पूछें' },
    { en: 'I need to request my medical records.', Chinese: '申请获取个人病历', Spanish: 'Solicitar mis registros médicos', French: 'Demander mes dossiers médicaux', Korean: '의료 기록 요청', Japanese: '診療記録を請求したい', Portuguese: 'Solicitar meus registros médicos', Vietnamese: 'Yêu cầu hồ sơ bệnh án của tôi', Hindi: 'अपने मेडिकल रिकॉर्ड माँगें' },
  ],
  'Banking & Finance': [
    { en: 'I want to dispute an incorrect charge on my bill.', Chinese: '账单错误收费申诉', Spanish: 'Disputar cargo incorrecto en mi factura', French: 'Contester un débit incorrect sur ma facture', Korean: '청구서 오류 이의 제기', Japanese: '請求の誤りに異議申し立て', Portuguese: 'Contestar cobrança incorreta na fatura', Vietnamese: 'Khiếu nại khoản phí sai trên hóa đơn', Hindi: 'बिल पर गलत चार्ज का विरोध करें' },
    { en: 'I need to report a lost card and order a replacement.', Chinese: '挂失卡片并补办新卡', Spanish: 'Reportar tarjeta perdida y pedir reemplazo', French: 'Signaler une carte perdue et en commander une nouvelle', Korean: '분실 카드 신고 및 재발급', Japanese: '紛失カードの届出と再発行', Portuguese: 'Reportar cartão perdido e pedir novo', Vietnamese: 'Báo mất thẻ và xin cấp thẻ mới', Hindi: 'खोया हुआ कार्ड रिपोर्ट करें और नया माँगें' },
    { en: 'I need to dispute a fraudulent transaction on my account.', Chinese: '申诉账户上的欺诈交易', Spanish: 'Disputar una transacción fraudulenta en mi cuenta', French: 'Contester une transaction frauduleuse sur mon compte', Korean: '계좌의 사기 거래 이의 제기', Japanese: '不正取引に異議を申し立てたい', Portuguese: 'Contestar transação fraudulenta na minha conta', Vietnamese: 'Khiếu nại giao dịch gian lận trong tài khoản', Hindi: 'खाते में धोखाधड़ी लेनदेन का विरोध करें' },
    { en: 'I want to check why a payment was declined.', Chinese: '查询付款被拒绝的原因', Spanish: 'Consultar por qué se rechazó un pago', French: 'Vérifier pourquoi un paiement a été refusé', Korean: '결제 거절 이유 확인', Japanese: '支払いが却下された理由を確認したい', Portuguese: 'Verificar por que um pagamento foi recusado', Vietnamese: 'Kiểm tra lý do thanh toán bị từ chối', Hindi: 'पेमेंट क्यों अस्वीकार हुई यह जांचें' },
    { en: 'I want to increase my credit card limit.', Chinese: '申请提高信用卡额度', Spanish: 'Solicitar aumento de límite de crédito', French: 'Demander une augmentation de ma limite de crédit', Korean: '신용카드 한도 증액 신청', Japanese: 'クレジットカードの限度額を上げたい', Portuguese: 'Solicitar aumento do limite do cartão', Vietnamese: 'Yêu cầu tăng hạn mức tín dụng', Hindi: 'क्रेडिट कार्ड लिमिट बढ़ाएं' },
    { en: 'I need to set up automatic bill payments.', Chinese: '设置账单自动付款', Spanish: 'Configurar pagos automáticos de facturas', French: 'Configurer des paiements automatiques', Korean: '자동 청구서 납부 설정', Japanese: '自動支払いを設定したい', Portuguese: 'Configurar pagamentos automáticos de contas', Vietnamese: 'Thiết lập thanh toán hóa đơn tự động', Hindi: 'स्वचालित बिल भुगतान सेट करें' },
  ],
  'Utilities & Home': [
    { en: 'My internet has been out for days — I need it fixed urgently.', Chinese: '网络断了好几天，急需修复', Spanish: 'Mi internet lleva días sin funcionar, reparación urgente', French: 'Mon internet est en panne depuis des jours, réparation urgente', Korean: '인터넷이 며칠째 불통, 긴급 수리 요청', Japanese: 'ネットが数日止まり、緊急修理が必要', Portuguese: 'Internet sem serviço há dias, reparo urgente', Vietnamese: 'Internet mất mấy ngày, cần sửa gấp', Hindi: 'इंटरनेट कई दिनों से बंद है, तुरंत ठीक करें' },
    { en: 'I want to downgrade my internet plan to save money.', Chinese: '降级网络套餐以节省费用', Spanish: 'Cambiar a un plan de internet más económico', French: 'Passer à un forfait internet moins cher', Korean: '저렴한 인터넷 요금제로 변경', Japanese: 'インターネットプランをダウングレードしたい', Portuguese: 'Mudar para um plano de internet mais barato', Vietnamese: 'Chuyển xuống gói internet rẻ hơn', Hindi: 'पैसे बचाने के लिए इंटरनेट प्लान डाउनग्रेड करें' },
    { en: 'I need to schedule a technician visit for a repair.', Chinese: '预约技术人员上门维修', Spanish: 'Programar una visita de técnico para una reparación', French: 'Planifier une visite de technicien pour une réparation', Korean: '수리를 위한 기술자 방문 예약', Japanese: '修理のため技術者の訪問を予約したい', Portuguese: 'Agendar visita de técnico para reparo', Vietnamese: 'Đặt lịch kỹ thuật viên đến sửa chữa', Hindi: 'मरम्मत के लिए तकनीशियन विजिट शेड्यूल करें' },
    { en: 'I want to report an issue with my electricity bill.', Chinese: '反映电费账单问题', Spanish: 'Reportar un problema con mi factura eléctrica', French: 'Signaler un problème avec ma facture d\'électricité', Korean: '전기 요금 청구서 문제 신고', Japanese: '電気代の請求書の問題を報告したい', Portuguese: 'Reportar problema com minha conta de luz', Vietnamese: 'Báo cáo vấn đề với hóa đơn điện', Hindi: 'बिजली बिल की समस्या रिपोर्ट करें' },
    { en: 'I need to change my trash pickup schedule.', Chinese: '更改垃圾收运时间', Spanish: 'Cambiar el horario de recolección de basura', French: 'Modifier mon calendrier de collecte des ordures', Korean: '쓰레기 수거 일정 변경', Japanese: 'ゴミ収集のスケジュールを変更したい', Portuguese: 'Mudar o horário de coleta de lixo', Vietnamese: 'Thay đổi lịch thu gom rác', Hindi: 'कचरा संग्रह का समय बदलें' },
    { en: 'I want to transfer my utilities to a new address.', Chinese: '将公共事业服务迁移至新地址', Spanish: 'Transferir mis servicios de utilidades a una nueva dirección', French: 'Transférer mes services publics à une nouvelle adresse', Korean: '유틸리티 서비스를 새 주소로 이전', Japanese: '公共料金サービスを新住所に移転したい', Portuguese: 'Transferir serviços públicos para novo endereço', Vietnamese: 'Chuyển dịch vụ tiện ích sang địa chỉ mới', Hindi: 'यूटिलिटी सेवाएं नए पते पर ट्रांसफर करें' },
  ],
  'Customer Service': [
    { en: 'I want to cancel my subscription and request a full refund.', Chinese: '取消订阅并申请全额退款', Spanish: 'Cancelar suscripción y solicitar reembolso completo', French: 'Annuler mon abonnement et demander un remboursement complet', Korean: '구독 취소 및 전액 환불 요청', Japanese: 'サブスク解約・全額返金申請', Portuguese: 'Cancelar assinatura e solicitar reembolso total', Vietnamese: 'Hủy đăng ký và yêu cầu hoàn tiền đầy đủ', Hindi: 'सदस्यता रद्द करें और पूरा रिफंड माँगें' },
    { en: 'I want to escalate my issue and speak to a supervisor.', Chinese: '要求转接上级主管', Spanish: 'Escalar mi problema y hablar con un supervisor', French: 'Escalader mon problème et parler à un superviseur', Korean: '상위 책임자 연결 요청', Japanese: '上位担当者への引継ぎを要請したい', Portuguese: 'Escalar problema e falar com supervisor', Vietnamese: 'Leo thang vấn đề và yêu cầu gặp giám sát viên', Hindi: 'समस्या escalate करें और सुपरवाइज़र से बात करें' },
    { en: 'I need to return an item and get a replacement.', Chinese: '退货并申请换货', Spanish: 'Devolver un artículo y obtener un reemplazo', French: 'Retourner un article et obtenir un remplacement', Korean: '상품 반품 및 교환 요청', Japanese: '商品を返品して交換品を受け取りたい', Portuguese: 'Devolver item e obter substituição', Vietnamese: 'Trả hàng và lấy hàng thay thế', Hindi: 'आइटम वापस करें और बदलाव पाएं' },
    { en: 'I need to report that my package was not delivered.', Chinese: '反映包裹未送达问题', Spanish: 'Reportar que mi paquete no fue entregado', French: 'Signaler que mon colis n\'a pas été livré', Korean: '택배 미배송 신고', Japanese: '荷物が届かなかったことを報告したい', Portuguese: 'Reportar que meu pacote não foi entregue', Vietnamese: 'Báo cáo gói hàng chưa được giao', Hindi: 'रिपोर्ट करें कि पार्सल डिलीवर नहीं हुआ' },
    { en: 'I want to change my plan to a cheaper option.', Chinese: '申请更换更便宜的套餐', Spanish: 'Cambiar mi plan a una opción más económica', French: 'Changer mon forfait pour une option moins chère', Korean: '더 저렴한 요금제로 변경', Japanese: 'より安いプランに変更したい', Portuguese: 'Mudar para plano mais barato', Vietnamese: 'Chuyển sang gói dịch vụ rẻ hơn', Hindi: 'सस्ते प्लान में बदलें' },
    { en: 'I need to dispute a charge and get a credit on my account.', Chinese: '申诉收费并申请账户积分退还', Spanish: 'Disputar un cargo y obtener un crédito en mi cuenta', French: 'Contester un débit et obtenir un crédit sur mon compte', Korean: '청구 이의 신청 및 계좌 크레딧 요청', Japanese: '請求に異議を申し立てて口座にクレジットを適用したい', Portuguese: 'Contestar cobrança e obter crédito na conta', Vietnamese: 'Khiếu nại phí và yêu cầu tín dụng vào tài khoản', Hindi: 'चार्ज का विरोध करें और खाते में क्रेडिट पाएं' },
  ],
};

export function t(language: string): LangStrings {
  return UI[language] ?? UI['Chinese'];
}

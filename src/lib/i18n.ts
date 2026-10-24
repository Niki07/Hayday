"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Lang = "en" | "es";

const en = {
  // Header, footer, toggle
  "nav.home": "Hayday home",
  "lang.label": "Language",
  "lang.en": "EN",
  "lang.es": "ES",
  "footer.privacy": "We do not save your photo, your name or your pay stub.",
  "footer.terms": "Terms and privacy",
  "terms.title": "Terms and privacy",
  "terms.intro": "Hayday is a free tool that helps farmworkers check a pay stub against California pay rules. Please read these short terms before relying on it.",
  "terms.s1.title": "We do not save your data",
  "terms.s1.body": "Your photo, your name and the numbers on your pay stub are used only while you are on this site. The photo is sent to an AI service to be read and is not stored by Hayday afterwards. Nothing is saved on our servers, and we do not create accounts or track you. If you close the tab, it is gone.",
  "terms.s2.title": "The result is an estimate, not a guarantee",
  "terms.s2.body": "Hayday is not 100% accurate. The amount it shows is an estimate, based only on the numbers you entered and the rules we were able to program. The real amount you are owed could be higher or lower, and some situations are not covered at all. Treat the result as a helpful starting point, not a final answer, and have a free legal aid office or the California Labor Commissioner confirm it. Hayday does not give legal advice.",
  "terms.s3.title": "Accuracy and limits",
  "terms.s3.body": "We check the most common problems: minimum wage, daily and weekly overtime, paid rest breaks for piece-rate work, missed meal and rest breaks, missing hours and missing information on the stub. Rates come from the California Department of Industrial Relations. Where the law has exceptions we could not cover, the estimate is kept on the low side. The AI may misread a photo, so always check the numbers on the review screen.",
  "terms.s4.title": "Your rights",
  "terms.s4.body": "It is illegal for an employer to punish you for asking about your pay or filing a wage claim. You can file a claim with the Labor Commissioner at no cost, with or without a lawyer, and you do not need immigration papers to do so.",
  "terms.s5.title": "Who made this",
  "terms.s5.body": "Hayday was built in one day at a Central Valley hackathon by a team of two students. It is a prototype. We welcome corrections from legal aid organizations.",
  "terms.help": "Find free legal aid",

  "footer.help": "Get free help",
  "footer.estimate": "Hayday gives estimates, not legal advice.",

  // Home
  "home.headline": "Make every payday a Hayday.",
  "home.subline": "Take a photo of your pay stub. We check if you were paid correctly.",
  "home.cta": "Check my pay stub",
  "home.sample": "Try a sample",
  "home.checks.title": "What we check",
  "home.checks.1": "Minimum wage and overtime",
  "home.checks.2": "Paid rest breaks for piece-rate work",
  "home.checks.3": "Missing hours or missing information on the stub",
  "home.stub.caption":
    "This is a pay stub. It comes with your check or in your payroll app.",
  "home.stub.alt": "Illustration of a pay stub with hours, rate and pay listed",
  "home.privacy.title": "Your privacy",
  "home.privacy.body": "We do not save your photo, your name or your pay stub.",

  // Pay stub illustration labels
  "stub.title": "Earnings statement",
  "stub.period": "Pay period",
  "stub.hours": "Hours",
  "stub.rate": "Rate",
  "stub.pieces": "Pieces",
  "stub.gross": "Gross pay",
  "stub.net": "Net pay",

  // Stub pages
  "check.title": "Check my pay stub",
  "review.title": "Review your pay stub",
  "result.title": "Your result",
  "claim.title": "Your claim",
  "stub.coming": "This page is coming soon.",

  // Help
  "help.title": "Get free help",
  "help.intro":
    "These groups help farmworkers with pay problems. Their help is free or low cost, and your immigration status does not change your wage rights in California.",
  "help.labor.title": "File a wage claim with the State",
  "help.labor.name": "California Labor Commissioner",
  "help.labor.desc":
    "The state office that handles wage claims. You can file for free, online, by mail or in person.",
  "help.visit": "Visit website",
  "help.nearby":
    "No office in this county that we could verify. These are the nearest offices:",
  "help.crla.name": "California Rural Legal Assistance (CRLA)",
  "help.crla.desc":
    "Nonprofit law firm for people in rural California. Handles employment problems such as unpaid wages.",
  "help.ccls.name": "Central California Legal Services",
  "help.ccls.desc":
    "Free civil legal help for low-income people. Ask them if they can help with a pay problem.",
  "help.disclaimer":
    "Check each group's website for current hours and what they can help with. Offices and services can change.",
  "county.fresno": "Fresno County",
  "county.kern": "Kern County",
  "county.tulare": "Tulare County",
  "county.kings": "Kings County",
  "county.madera": "Madera County",
  "county.merced": "Merced County",
  "county.stanislaus": "Stanislaus County",
  "county.sanjoaquin": "San Joaquin County",
  "help.office.fresno": "Office in Fresno",
  "help.office.delano": "Offices in Delano and Lamont",
  "help.office.tulare": "Office in Tulare",
  "help.office.visalia": "Office in Visalia",
  "help.office.madera": "Office in Madera",
  "help.office.merced": "Office in Merced",
  "help.office.modesto": "Office in Modesto",
  "help.office.stockton": "Office in Stockton",

  // Result page (handoff 05)
  "result.noData": "We do not have a pay stub to show yet.",
  "result.noData.cta": "Check my pay stub",
  "result.owed": "You may be owed",
  "result.problems": "We found problems on this pay stub",
  "result.sub": "Each item below shows the rule and why it applies.",
  "result.items": "What we found",
  "result.also": "Also noticed",
  "result.rule": "Rule",
  "result.severity.high": "Clear issue",
  "result.severity.medium": "Possible issue",
  "result.severity.info": "Note",
  "result.correct.title": "This pay stub looks correct",
  "result.correct.body":
    "We did not find a problem with this pay stub and your answers. This is what we checked:",
  "result.rule.min-wage": "Minimum wage",
  "result.rule.daily-ot": "Overtime after 8 hours in a day",
  "result.rule.weekly-ot": "Overtime after 40 hours in a week",
  "result.rule.piece-rest": "Paid rest breaks for piece-rate work",
  "result.rule.meal-premium": "Missed meal breaks",
  "result.rule.rest-premium": "Missed rest breaks",
  "result.rule.unpaid-hours": "Hours worked that are not on the stub",
  "result.rule.math-mismatch": "Pay stub adds up",
  "result.rule.stub-incomplete": "Pay stub has all required information",
  "result.disclaimer":
    "This is an estimate based on what you entered. A free legal aid office can confirm it.",
  "result.disclaimer.cta": "Find free legal help",
  "help.legalAid": "Find free legal aid",
  "help.fileClaim": "How to file a wage claim",
  "result.claim": "Prepare my claim",
  "result.again": "Check another pay stub",
  "result.edit": "Change my answers",

  // Claim page (handoff 05)
  "claim.noData": "We do not have a result to write a letter from yet.",
  "claim.noData.cta": "Check my pay stub",
  "claim.heading": "Your claim letter",
  "claim.intro":
    "Your letter is ready in English and in Spanish. Read it, then download it or copy it.",
  "claim.name.label": "Your name, optional",
  "claim.name.hint": "Used only in this letter. We do not save it.",
  "claim.name.update": "Update my letter",
  "claim.writing": "Writing your letter...",
  "claim.writing.sub": "This can take up to 10 seconds.",
  "claim.error": "We could not write your letter.",
  "claim.retry": "Try again",
  "claim.tab.en": "English",
  "claim.tab.es": "Español",
  "claim.download": "Download PDF",
  "claim.download.hint": "The PDF uses the language selected below. In the print window, choose Save as PDF.",
  "claim.copy": "Copy text",
  "claim.copied": "Copied",
  "claim.copyFailed": "Could not copy. Select the text and copy it by hand.",
  "claim.next.title": "Next steps",
  "claim.next.1": "Keep all your pay stubs, even old ones.",
  "claim.next.2": "Write down the hours you work every day and the breaks you get.",
  "claim.next.3": "Contact a free legal aid office. They can check this letter and help you.",
  "claim.next.3.link": "Find legal aid",
  "claim.next.4": "You can also file a wage claim with the California Labor Commissioner.",
  "claim.next.4.link": "File a wage claim",
  "claim.back": "Back to my result",
  "claim.table.title": "Findings",
  "claim.table.issue": "Issue",
  "claim.table.rule": "Rule",
  "claim.table.amount": "Amount",
  "claim.table.total": "Total",

  // Upload page (handoff 04)
  "check.subtitle": "Take a clear photo of your whole pay stub, or upload one from your phone or computer.",
  "check.photo": "Take a photo",
  "check.upload": "Upload a file",
  "check.tip": "Lay the stub flat, use good light, and make sure every number is in the picture.",
  "check.sample": "Try a sample",
  "check.sampleTitle": "Choose a sample pay stub",
  "check.sampleIntro": "These pay stubs are made up so you can see how Hayday works. Nothing is uploaded.",
  "check.close": "Close",
  "check.reading": "Reading your pay stub...",
  "check.readingNote": "This can take up to 15 seconds.",
  "check.previewAlt": "Photo of your pay stub",
  "check.privacy": "Your photo is read and then thrown away. We do not save it.",
  "check.error.title": "We could not read that",
  "check.error.generic":
    "Something went wrong while reading your pay stub. You can try again, or type the numbers yourself.",
  "check.error.network": "We could not reach the server. Check your internet connection and try again.",
  "check.error.type": "We cannot read that kind of file. Try a photo of the stub, or type the numbers yourself.",
  "check.error.size": "That file is too large. Try a smaller photo, or type the numbers yourself.",
  "check.error.image": "We could not open that picture. Try another photo, or type the numbers yourself.",
  "check.retry": "Try again",
  "check.byHand": "Enter details by hand",
  "check.noStub": "No pay stub? Enter what you know",
  "check.noStub.note": "Your employer must give you a pay stub every payday. If you never got one, we can still check your pay from your hours and what you were paid.",
  "review.noStubNotice": "No pay stub is itself a problem: California requires employers to give one with every paycheck (Labor Code § 226). Enter what you know and we will still check your pay. Your own notes, texts or photos of your hours count as evidence.",

  // Review page (handoff 04)
  "review.intro": "Check that Hayday read your pay stub correctly. Fix anything that is wrong.",
  "review.byHandIntro": "Type what you know: your hours, how you were paid, and what you received. You can leave blank anything you do not have.",
  "review.lowConfidence": "Please check these numbers.",
  "review.lowConfidenceBody": "The photo was hard to read, so some numbers may be wrong.",
  "review.unreadable": "We could not read this pay stub. Please type the numbers from your pay stub.",
  "review.photo": "Your photo",
  "review.stubSection": "From your pay stub",
  "review.employer": "Employer",
  "review.periodStart": "Pay period starts",
  "review.periodEnd": "Pay period ends",
  "review.payType": "How you are paid",
  "review.payType.hourly": "By the hour",
  "review.payType.piece": "By the piece",
  "review.payType.mixed": "Both",
  "review.payType.unknown": "Not sure",
  "review.hours": "Total hours",
  "review.hoursHelp": "All hours on the stub, including overtime.",
  "review.hourlyRate": "Hourly rate ($)",
  "review.overtimeHours": "Overtime hours",
  "review.overtimeRate": "Overtime rate ($)",
  "review.pieceUnits": "Pieces (trays, bins, buckets)",
  "review.pieceRate": "Pay per piece ($)",
  "review.restBreakPay": "Rest break pay ($)",
  "review.restBreakPayHelp": "Only if the stub lists it on its own line.",
  "review.gross": "Gross pay ($)",
  "review.net": "Net pay ($)",
  "review.questionsSection": "About your work",
  "review.county": "Which county did you work in?",
  "review.countyPlaceholder": "Choose a county",
  "review.countyValley": "Central Valley",
  "review.countyOtherGroup": "Elsewhere",
  "review.countyOther": "Other California county",
  "review.days": "How many days did you work in this pay period?",
  "review.hoursEachDay": "How many hours did you work each day?",
  "review.day": "Day",
  "review.rest": "Did you get your 10-minute rest breaks?",
  "review.meal": "Did you get a 30-minute meal break on days you worked more than 5 hours?",
  "review.piece": "Were you paid by the piece (trays, bins, buckets)?",
  "review.yes": "Yes",
  "review.some": "Some days",
  "review.no": "No",
  "review.submit": "Check my pay",
  "review.startOver": "Start over",
  "review.errorCounty": "Please choose your county.",
  "review.errorHours": "Enter between 1 and 24 hours for each day.",
  "review.errorAnswer": "Please choose an answer.",
  "review.errorSummary": "Please fix the items marked above.",

  // Trust batch (handoff 08): the real law, visibly
  "footer.rules": "The rules we check",
  "trust.line":
    "Checks your stub against California Labor Code sections 226, 226.2, 226.7, 512, 857, 1182.12 and 1194, and Wage Order 14. Rates verified with the state on {date}.",
  "trust.link": "The rules we check",
  "result.law.title": "Checked against California law",
  "result.law.rates": "Rates from the California Department of Industrial Relations, verified {date}",
  "result.law.how": "How we check",
  "result.law.opens": "(opens in a new tab)",
  "result.law.helpTitle": "Free legal help in {county}",
  "result.law.helpTitleState": "Free legal help in California",
  "result.law.countyNote":
    "California pay rules are the same in every county. We use your county only to show help near you.",
  "result.law.allHelp": "See all legal aid offices",
  "rules.title": "The rules we check",
  "rules.intro":
    "Every check Hayday runs comes from a California law you can read yourself. These pay rules are the same across the whole state. In the Central Valley counties we cover, no city or county sets its own minimum wage. We use your county only to show you free legal help near you, never to change a pay rule.",
  "rules.verified": "Rates were verified on the California Department of Industrial Relations website on {date}. Hayday gives estimates, not legal advice.",
  "rules.law": "Read the law",
  "rules.more": "More from the State",
  "rules.effective": "In effect since {date}",
  "rules.notCovered": "Not covered yet",
  "rules.wage.title": "State minimum wage, per hour",
  "rules.wage.row": "From {date}: {rate}",
  "rules.threshold.daily": "1.5 times your regular rate after {a} hours in a day, double after {b} hours.",
  "rules.threshold.weekly": "1.5 times your regular rate after {a} hours in a week.",
  "rules.cta": "Check my pay stub",
  "rules.min-wage.body":
    "Every hour you work must pay at least the California minimum wage, even if you are paid by the piece. The rate is the same for all employers across the state, and the rate that counts is the one in effect on the days you worked.",
  "rules.daily-ot.body":
    "Farmworkers get 1.5 times their regular rate for hours over 8 in a day, and double their regular rate for hours over 12. Your straight pay is already on the stub, so we look for the missing extra part.",
  "rules.weekly-ot.body":
    "Hours over 40 in a week are also paid at 1.5 times the regular rate. Hours already counted as daily overtime are not counted twice.",
  "rules.piece-rest.body":
    "If you are paid by the piece, your 10-minute rest breaks must be paid separately, at your average hourly rate, on top of your piece pay.",
  "rules.meal-premium.body":
    "If you work more than 5 hours in a day, you must get a 30-minute meal break. For each day a meal break is missed, your employer owes you one extra hour of pay.",
  "rules.rest-premium.body":
    "You must get a paid 10-minute rest break for every 4 hours you work. For each day the rest breaks are missed, your employer owes you one extra hour of pay.",
  "rules.unpaid-hours.body":
    "Every hour you work must be paid. If you tell us you worked more hours than the stub shows, the missing hours are owed at your regular rate, and never less than the minimum wage. For piece-rate work, time that piece pay does not cover must be paid at least at the minimum wage.",
  "rules.math-mismatch.body":
    "A pay stub must be accurate. Hours times rate, plus overtime, minus deductions, should match the gross and net pay shown. We point out differences of more than $1.",
  "rules.stub-incomplete.body":
    "A pay stub must show the employer's name, the pay period dates, total hours, your pay rates, gross pay, deductions and net pay. We list what is missing so you can ask your employer for a complete stub.",
  // Organizer view (handoff 09, hidden page)
  "org.title": "Organizer view",
  "org.intro": "Load pay stubs from one employer to see which pay rules are broken, on how many stubs, and the estimated total owed.",
  "org.privacy": "Nothing you upload is stored. Photos are read once and not saved, and this page forgets everything when you reload it.",
  "org.county": "County",
  "org.countyOther": "Other California county",
  "org.employer": "Employer name (optional)",
  "org.employerLabel": "Employer",
  "org.employerPlaceholder": "For example, Sunfield Vineyards LLC",
  "org.addPhotos": "Add pay stub photos",
  "org.loadSample": "Load sample employer",
  "org.clear": "Clear all",
  "org.photosNote": "Each photo takes 7 to 15 seconds to read. Two are read at a time.",
  "org.empty": "No pay stubs yet. Add photos or load the sample employer.",
  "org.summary.stubs": "Stubs loaded",
  "org.summary.issues": "Stubs with issues",
  "org.summary.total": "Estimated owed",
  "org.patterns": "Patterns",
  "org.patternsNone": "No problems found on these stubs.",
  "org.of": "of",
  "org.stubs": "stubs",
  "org.table": "Pay stubs",
  "org.col.worker": "Worker",
  "org.col.period": "Pay period",
  "org.col.payType": "Pay type",
  "org.col.hours": "Hours",
  "org.col.gross": "Gross pay",
  "org.col.issues": "Issues",
  "org.col.owed": "Estimated owed",
  "org.total": "Total",
  "org.est": "est.",
  "org.estNote": "est. = estimated from an assumed schedule",
  "org.noIssues": "None found",
  "org.status.queued": "Waiting…",
  "org.status.reading": "Reading the photo…",
  "org.status.error": "Could not read this photo.",
  "org.retry": "Try again",
  "org.remove": "Remove",
  "org.exportCsv": "Export CSV",
  "org.print": "Print",
  "org.caveat":
    "Organizer view checks the stub only. Rest-break pay assumes a 5-day week; overtime counts only hours over 40 a week. Daily overtime, missed breaks and unpaid hours are not counted. Real amounts are usually higher.",
  "org.payType.unknown": "Unknown",
} as const;

export type TKey = keyof typeof en;

const es: Record<TKey, string> = {
  "nav.home": "Inicio de Hayday",
  "lang.label": "Idioma",
  "lang.en": "EN",
  "lang.es": "ES",
  "footer.privacy": "No guardamos su foto, su nombre ni su talón de pago.",
  "footer.terms": "Términos y privacidad",
  "terms.title": "Términos y privacidad",
  "terms.intro": "Hayday es una herramienta gratuita que ayuda a los trabajadores del campo a revisar un talón de pago según las reglas de pago de California. Lea estos términos breves antes de confiar en el resultado.",
  "terms.s1.title": "No guardamos sus datos",
  "terms.s1.body": "Su foto, su nombre y los números de su talón de pago se usan solo mientras está en este sitio. La foto se envía a un servicio de inteligencia artificial para leerla y Hayday no la guarda después. No se guarda nada en nuestros servidores, no creamos cuentas y no lo rastreamos. Si cierra la pestaña, todo desaparece.",
  "terms.s2.title": "El resultado es un cálculo aproximado, no una garantía",
  "terms.s2.body": "Hayday no es 100% exacto. La cantidad que muestra es un cálculo aproximado, basado solo en los números que usted ingresó y en las reglas que pudimos programar. La cantidad real que se le debe puede ser mayor o menor, y algunas situaciones no están cubiertas. Tome el resultado como un punto de partida útil, no como una respuesta final, y pida a una oficina de ayuda legal gratuita o al Comisionado del Trabajo de California que lo confirme. Hayday no da asesoría legal.",
  "terms.s3.title": "Exactitud y límites",
  "terms.s3.body": "Revisamos los problemas más comunes: salario mínimo, horas extra diarias y semanales, descansos pagados en el trabajo a destajo, descansos y comidas no otorgados, horas que faltan y datos que faltan en el talón. Las tarifas vienen del Departamento de Relaciones Industriales de California. Donde la ley tiene excepciones que no pudimos cubrir, el cálculo se mantiene por lo bajo. La inteligencia artificial puede leer mal una foto, así que siempre revise los números en la pantalla de revisión.",
  "terms.s4.title": "Sus derechos",
  "terms.s4.body": "Es ilegal que un empleador lo castigue por preguntar sobre su pago o por presentar un reclamo de salarios. Puede presentar un reclamo ante el Comisionado del Trabajo sin costo, con o sin abogado, y no necesita papeles de inmigración para hacerlo.",
  "terms.s5.title": "Quién hizo esto",
  "terms.s5.body": "Hayday se construyó en un día en un hackathon del Valle Central por un equipo de dos estudiantes. Es un prototipo. Agradecemos correcciones de las organizaciones de ayuda legal.",
  "terms.help": "Buscar ayuda legal gratis",

  "footer.help": "Obtenga ayuda gratis",
  "footer.estimate": "Hayday da cálculos aproximados, no asesoría legal.",

  "home.headline": "Haga de cada día de pago un Hayday.",
  "home.subline":
    "Tome una foto de su talón de pago. Revisamos si le pagaron lo correcto.",
  "home.cta": "Revisar mi talón de pago",
  "home.sample": "Probar un ejemplo",
  "home.checks.title": "Qué revisamos",
  "home.checks.1": "Salario mínimo y horas extra",
  "home.checks.2": "Descansos pagados en el trabajo a destajo",
  "home.checks.3": "Horas o datos que faltan en el talón",
  "home.stub.caption":
    "Este es un talón de pago. Viene con su cheque o en la aplicación de nómina.",
  "home.stub.alt":
    "Ilustración de un talón de pago con las horas, la tarifa y el pago",
  "home.privacy.title": "Su privacidad",
  "home.privacy.body": "No guardamos su foto, su nombre ni su talón de pago.",

  "stub.title": "Estado de ganancias",
  "stub.period": "Período de pago",
  "stub.hours": "Horas",
  "stub.rate": "Tarifa",
  "stub.pieces": "Piezas",
  "stub.gross": "Pago bruto",
  "stub.net": "Pago neto",

  "check.title": "Revisar mi talón de pago",
  "review.title": "Revise su talón de pago",
  "result.title": "Su resultado",
  "claim.title": "Su reclamo",
  "stub.coming": "Esta página estará disponible pronto.",

  "help.title": "Obtenga ayuda gratis",
  "help.intro":
    "Estos grupos ayudan a los trabajadores del campo con problemas de pago. Su ayuda es gratuita o de bajo costo, y su estatus migratorio no cambia sus derechos de pago en California.",
  "help.labor.title": "Presente un reclamo de salarios ante el Estado",
  "help.labor.name": "Comisionado Laboral de California",
  "help.labor.desc":
    "La oficina estatal que atiende los reclamos de salarios. Puede presentar su reclamo gratis, en línea, por correo o en persona.",
  "help.visit": "Visitar el sitio web",
  "help.nearby":
    "No pudimos verificar una oficina en este condado. Estas son las más cercanas:",
  "help.crla.name": "California Rural Legal Assistance (CRLA)",
  "help.crla.desc":
    "Bufete sin fines de lucro para personas de zonas rurales de California. Atiende problemas de trabajo, como salarios sin pagar.",
  "help.ccls.name": "Central California Legal Services",
  "help.ccls.desc":
    "Ayuda legal civil gratuita para personas de bajos ingresos. Pregunte si pueden ayudarle con un problema de pago.",
  "help.disclaimer":
    "Revise el sitio web de cada grupo para ver los horarios actuales y en qué pueden ayudarle. Las oficinas y los servicios pueden cambiar.",
  "county.fresno": "Condado de Fresno",
  "county.kern": "Condado de Kern",
  "county.tulare": "Condado de Tulare",
  "county.kings": "Condado de Kings",
  "county.madera": "Condado de Madera",
  "county.merced": "Condado de Merced",
  "county.stanislaus": "Condado de Stanislaus",
  "county.sanjoaquin": "Condado de San Joaquin",
  "help.office.fresno": "Oficina en Fresno",
  "help.office.delano": "Oficinas en Delano y Lamont",
  "help.office.tulare": "Oficina en Tulare",
  "help.office.visalia": "Oficina en Visalia",
  "help.office.madera": "Oficina en Madera",
  "help.office.merced": "Oficina en Merced",
  "help.office.modesto": "Oficina en Modesto",
  "help.office.stockton": "Oficina en Stockton",

  "result.noData": "Todavía no tenemos un talón de pago para mostrar.",
  "result.noData.cta": "Revisar mi talón de pago",
  "result.owed": "Es posible que le deban",
  "result.problems": "Encontramos problemas en este talón de pago",
  "result.sub": "Cada punto de abajo muestra la regla y por qué se aplica.",
  "result.items": "Lo que encontramos",
  "result.also": "También notamos",
  "result.rule": "Regla",
  "result.severity.high": "Problema claro",
  "result.severity.medium": "Posible problema",
  "result.severity.info": "Nota",
  "result.correct.title": "Este talón de pago parece correcto",
  "result.correct.body":
    "No encontramos ningún problema con este talón de pago y sus respuestas. Esto fue lo que revisamos:",
  "result.rule.min-wage": "Salario mínimo",
  "result.rule.daily-ot": "Horas extra después de 8 horas al día",
  "result.rule.weekly-ot": "Horas extra después de 40 horas a la semana",
  "result.rule.piece-rest": "Descansos pagados en el trabajo a destajo",
  "result.rule.meal-premium": "Comidas no tomadas",
  "result.rule.rest-premium": "Descansos no tomados",
  "result.rule.unpaid-hours": "Horas trabajadas que no están en el talón",
  "result.rule.math-mismatch": "Las cuentas del talón cuadran",
  "result.rule.stub-incomplete": "El talón tiene todos los datos requeridos",
  "result.disclaimer":
    "Este es un cálculo aproximado con lo que usted escribió. Una oficina de ayuda legal gratuita puede confirmarlo.",
  "result.disclaimer.cta": "Buscar ayuda legal gratis",
  "help.legalAid": "Buscar ayuda legal gratis",
  "help.fileClaim": "Cómo presentar un reclamo de salarios",
  "result.claim": "Preparar mi reclamo",
  "result.again": "Revisar otro talón de pago",
  "result.edit": "Cambiar mis respuestas",

  "claim.noData": "Todavía no tenemos un resultado para escribir la carta.",
  "claim.noData.cta": "Revisar mi talón de pago",
  "claim.heading": "Su carta de reclamo",
  "claim.intro":
    "Su carta está lista en inglés y en español. Léala y luego descárguela o cópiela.",
  "claim.name.label": "Su nombre, opcional",
  "claim.name.hint": "Solo se usa en esta carta. No lo guardamos.",
  "claim.name.update": "Actualizar mi carta",
  "claim.writing": "Escribiendo su carta...",
  "claim.writing.sub": "Puede tardar hasta 10 segundos.",
  "claim.error": "No pudimos escribir su carta.",
  "claim.retry": "Intentar de nuevo",
  "claim.tab.en": "English",
  "claim.tab.es": "Español",
  "claim.download": "Descargar PDF",
  "claim.download.hint": "El PDF usa el idioma seleccionado abajo. En la ventana de impresión, elija Guardar como PDF.",
  "claim.copy": "Copiar texto",
  "claim.copied": "Copiado",
  "claim.copyFailed": "No se pudo copiar. Seleccione el texto y cópielo a mano.",
  "claim.next.title": "Próximos pasos",
  "claim.next.1": "Guarde todos sus talones de pago, incluso los viejos.",
  "claim.next.2": "Anote las horas que trabaja cada día y los descansos que recibe.",
  "claim.next.3":
    "Comuníquese con una oficina de ayuda legal gratuita. Pueden revisar esta carta y ayudarle.",
  "claim.next.3.link": "Buscar ayuda legal",
  "claim.next.4":
    "También puede presentar un reclamo de salarios ante el Comisionado Laboral de California.",
  "claim.next.4.link": "Presentar un reclamo de salarios",
  "claim.back": "Volver a mi resultado",
  "claim.table.title": "Hallazgos",
  "claim.table.issue": "Asunto",
  "claim.table.rule": "Regla",
  "claim.table.amount": "Cantidad",
  "claim.table.total": "Total",

  "check.subtitle":
    "Tome una foto clara de todo su talón de pago, o suba una desde su teléfono o computadora.",
  "check.photo": "Tomar una foto",
  "check.upload": "Subir un archivo",
  "check.tip":
    "Ponga el talón sobre una superficie plana, use buena luz y asegúrese de que se vean todos los números.",
  "check.sample": "Probar un ejemplo",
  "check.sampleTitle": "Elija un talón de ejemplo",
  "check.sampleIntro":
    "Estos talones son inventados para que vea cómo funciona Hayday. No se sube nada.",
  "check.close": "Cerrar",
  "check.reading": "Leyendo su talón de pago...",
  "check.readingNote": "Esto puede tardar hasta 15 segundos.",
  "check.previewAlt": "Foto de su talón de pago",
  "check.privacy": "Su foto se lee y después se descarta. No la guardamos.",
  "check.error.title": "No pudimos leerlo",
  "check.error.generic":
    "Algo salió mal al leer su talón de pago. Puede intentarlo de nuevo o escribir los números usted mismo.",
  "check.error.network":
    "No pudimos conectarnos con el servidor. Revise su conexión a internet e inténtelo de nuevo.",
  "check.error.type":
    "No podemos leer ese tipo de archivo. Pruebe con una foto del talón o escriba los números usted mismo.",
  "check.error.size":
    "Ese archivo es demasiado grande. Pruebe con una foto más pequeña o escriba los números usted mismo.",
  "check.error.image":
    "No pudimos abrir esa imagen. Pruebe con otra foto o escriba los números usted mismo.",
  "check.retry": "Intentar de nuevo",
  "check.byHand": "Escribir los datos a mano",
  "check.noStub": "¿No tiene talón de pago? Escriba lo que sabe",
  "check.noStub.note": "Su empleador debe darle un talón de pago cada día de pago. Si nunca lo recibió, igual podemos revisar su pago con sus horas y lo que le pagaron.",
  "review.noStubNotice": "No recibir talón de pago ya es un problema: California exige a los empleadores entregar uno con cada cheque (Código Laboral § 226). Escriba lo que sabe y revisaremos su pago de todos modos. Sus propias notas, mensajes o fotos de sus horas cuentan como evidencia.",

  "review.intro": "Verifique que Hayday leyó bien su talón de pago. Corrija lo que esté mal.",
  "review.byHandIntro":
    "Escriba lo que sabe: sus horas, cómo le pagaron y lo que recibió. Deje en blanco lo que no tenga.",
  "review.lowConfidence": "Por favor revise estos números.",
  "review.lowConfidenceBody": "La foto era difícil de leer, así que algunos números podrían estar mal.",
  "review.unreadable":
    "No pudimos leer este talón de pago. Por favor escriba los números de su talón.",
  "review.photo": "Su foto",
  "review.stubSection": "De su talón de pago",
  "review.employer": "Empleador",
  "review.periodStart": "El período de pago empieza",
  "review.periodEnd": "El período de pago termina",
  "review.payType": "Cómo le pagan",
  "review.payType.hourly": "Por hora",
  "review.payType.piece": "A destajo",
  "review.payType.mixed": "Las dos formas",
  "review.payType.unknown": "No estoy seguro",
  "review.hours": "Total de horas",
  "review.hoursHelp": "Todas las horas del talón, incluidas las horas extra.",
  "review.hourlyRate": "Tarifa por hora ($)",
  "review.overtimeHours": "Horas extra",
  "review.overtimeRate": "Tarifa de horas extra ($)",
  "review.pieceUnits": "Piezas (charolas, cajas, cubetas)",
  "review.pieceRate": "Pago por pieza ($)",
  "review.restBreakPay": "Pago de descansos ($)",
  "review.restBreakPayHelp": "Solo si el talón lo muestra en una línea aparte.",
  "review.gross": "Pago bruto ($)",
  "review.net": "Pago neto ($)",
  "review.questionsSection": "Sobre su trabajo",
  "review.county": "¿En qué condado trabajó?",
  "review.countyPlaceholder": "Elija un condado",
  "review.countyValley": "Valle Central",
  "review.countyOtherGroup": "Otro lugar",
  "review.countyOther": "Otro condado de California",
  "review.days": "¿Cuántos días trabajó en este período de pago?",
  "review.hoursEachDay": "¿Cuántas horas trabajó cada día?",
  "review.day": "Día",
  "review.rest": "¿Le dieron sus descansos de 10 minutos?",
  "review.meal":
    "¿Le dieron 30 minutos para comer los días que trabajó más de 5 horas?",
  "review.piece": "¿Le pagaron a destajo (por charola, caja o cubeta)?",
  "review.yes": "Sí",
  "review.some": "Algunos días",
  "review.no": "No",
  "review.submit": "Revisar mi pago",
  "review.startOver": "Empezar de nuevo",
  "review.errorCounty": "Por favor elija su condado.",
  "review.errorHours": "Escriba entre 1 y 24 horas para cada día.",
  "review.errorAnswer": "Por favor elija una respuesta.",
  "review.errorSummary": "Por favor corrija lo marcado arriba.",

  // Trust batch (handoff 08): the real law, visibly
  "footer.rules": "Las reglas que revisamos",
  "trust.line":
    "Revisa su talón con las secciones 226, 226.2, 226.7, 512, 857, 1182.12 y 1194 del Código Laboral de California y la Orden de Salarios 14. Tarifas verificadas con el Estado el {date}.",
  "trust.link": "Las reglas que revisamos",
  "result.law.title": "Revisado con la ley de California",
  "result.law.rates": "Tarifas del Departamento de Relaciones Industriales de California, verificadas el {date}",
  "result.law.how": "Cómo revisamos",
  "result.law.opens": "(se abre en otra pestaña)",
  "result.law.helpTitle": "Ayuda legal gratis en el {county}",
  "result.law.helpTitleState": "Ayuda legal gratis en California",
  "result.law.countyNote":
    "Las reglas de pago de California son las mismas en todos los condados. Usamos su condado solo para mostrarle ayuda cerca de usted.",
  "result.law.allHelp": "Ver todas las oficinas de ayuda legal",
  "rules.title": "Las reglas que revisamos",
  "rules.intro":
    "Cada revisión que hace Hayday viene de una ley de California que usted puede leer. Estas reglas de pago son las mismas en todo el estado. En los condados del Valle Central que cubrimos, ninguna ciudad ni condado fija su propio salario mínimo. Usamos su condado solo para mostrarle ayuda legal gratis cerca de usted, nunca para cambiar una regla de pago.",
  "rules.verified": "Las tarifas se verificaron en el sitio del Departamento de Relaciones Industriales de California el {date}. Hayday da cálculos aproximados, no asesoría legal.",
  "rules.law": "Leer la ley",
  "rules.more": "Más del Estado",
  "rules.effective": "En vigor desde el {date}",
  "rules.notCovered": "Todavía no cubrimos",
  "rules.wage.title": "Salario mínimo del Estado, por hora",
  "rules.wage.row": "Desde el {date}: {rate}",
  "rules.threshold.daily": "1.5 veces su pago normal después de {a} horas en un día, el doble después de {b} horas.",
  "rules.threshold.weekly": "1.5 veces su pago normal después de {a} horas en una semana.",
  "rules.cta": "Revisar mi talón de pago",
  "rules.min-wage.body":
    "Cada hora que trabaja debe pagarse al menos al salario mínimo de California, aunque le paguen por pieza. La tarifa es la misma para todos los empleadores del estado, y cuenta la que estaba en vigor en los días que usted trabajó.",
  "rules.daily-ot.body":
    "Los trabajadores agrícolas reciben 1.5 veces su pago normal por las horas después de 8 en un día, y el doble por las horas después de 12. Su pago normal ya está en el talón, así que buscamos la parte extra que falta.",
  "rules.weekly-ot.body":
    "Las horas después de 40 en una semana también se pagan a 1.5 veces el pago normal. Las horas que ya se contaron como horas extra del día no se cuentan dos veces.",
  "rules.piece-rest.body":
    "Si le pagan por pieza, sus descansos de 10 minutos deben pagarse aparte, a su pago promedio por hora, además de su pago por pieza.",
  "rules.meal-premium.body":
    "Si trabaja más de 5 horas en un día, debe tener una comida de 30 minutos. Por cada día que no le den la comida, su empleador le debe una hora extra de pago.",
  "rules.rest-premium.body":
    "Debe tener un descanso pagado de 10 minutos por cada 4 horas que trabaje. Por cada día que no le den los descansos, su empleador le debe una hora extra de pago.",
  "rules.unpaid-hours.body":
    "Cada hora que trabaja debe pagarse. Si nos dice que trabajó más horas de las que muestra el talón, las horas que faltan se deben a su pago normal, y nunca por menos del salario mínimo. En el trabajo a destajo, el tiempo que el pago por pieza no cubre debe pagarse al menos al salario mínimo.",
  "rules.math-mismatch.body":
    "Un talón de pago debe ser exacto. Las horas por la tarifa, más las horas extra, menos las deducciones, deben coincidir con el pago bruto y neto. Avisamos de diferencias de más de $1.",
  "rules.stub-incomplete.body":
    "Un talón de pago debe mostrar el nombre del empleador, las fechas del periodo, el total de horas, sus tarifas, el pago bruto, las deducciones y el pago neto. Listamos lo que falta para que pueda pedirle a su empleador un talón completo.",
  // Organizer view (handoff 09, hidden page)
  "org.title": "Vista para organizadores",
  "org.intro": "Cargue talones de pago de un mismo empleador para ver qué reglas de pago no se cumplen, en cuántos talones, y el total aproximado que se debe.",
  "org.privacy": "No guardamos nada de lo que sube. Las fotos se leen una vez y no se guardan, y esta página lo olvida todo cuando la vuelve a cargar.",
  "org.county": "Condado",
  "org.countyOther": "Otro condado de California",
  "org.employer": "Nombre del empleador (opcional)",
  "org.employerLabel": "Empleador",
  "org.employerPlaceholder": "Por ejemplo, Sunfield Vineyards LLC",
  "org.addPhotos": "Agregar fotos de talones",
  "org.loadSample": "Cargar empleador de ejemplo",
  "org.clear": "Borrar todo",
  "org.photosNote": "Cada foto tarda de 7 a 15 segundos en leerse. Se leen dos a la vez.",
  "org.empty": "Todavía no hay talones. Agregue fotos o cargue el empleador de ejemplo.",
  "org.summary.stubs": "Talones cargados",
  "org.summary.issues": "Talones con problemas",
  "org.summary.total": "Total aproximado que se debe",
  "org.patterns": "Patrones",
  "org.patternsNone": "No encontramos problemas en estos talones.",
  "org.of": "de",
  "org.stubs": "talones",
  "org.table": "Talones de pago",
  "org.col.worker": "Trabajador",
  "org.col.period": "Periodo de pago",
  "org.col.payType": "Tipo de pago",
  "org.col.hours": "Horas",
  "org.col.gross": "Pago bruto",
  "org.col.issues": "Problemas",
  "org.col.owed": "Cantidad aproximada",
  "org.total": "Total",
  "org.est": "aprox.",
  "org.estNote": "aprox. = calculado con un horario supuesto",
  "org.noIssues": "Ninguno",
  "org.status.queued": "En espera…",
  "org.status.reading": "Leyendo la foto…",
  "org.status.error": "No pudimos leer esta foto.",
  "org.retry": "Intentar otra vez",
  "org.remove": "Quitar",
  "org.exportCsv": "Exportar CSV",
  "org.print": "Imprimir",
  "org.caveat":
    "La vista para organizadores revisa solo el talón. El pago de descansos supone una semana de 5 días; el tiempo extra cuenta solo las horas después de 40 a la semana. No se cuentan el tiempo extra diario, los descansos no dados ni las horas que faltan. Las cantidades reales suelen ser más altas.",
  "org.payType.unknown": "Desconocido",
};

export const dictionary: Record<Lang, Record<TKey, string>> = { en, es };

const STORAGE_KEY = "hayday-lang";

// Tiny external store so the language is "en" on the server and during
// hydration, then switches to the saved choice without a mismatch.
let current: Lang = "en";
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "es") current = saved;
  } catch {
    // localStorage can be blocked; stay on English
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Lang {
  load();
  return current;
}

function getServerSnapshot(): Lang {
  return "en";
}

function setLangStore(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = useCallback((l: Lang) => setLangStore(l), []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return createElement(LanguageContext.Provider, { value: { lang, setLang } }, children);
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  const { lang } = useLanguage();
  return useCallback((key: TKey) => dictionary[lang][key], [lang]);
}

import type { Lang } from './LanguageContext'

// AM values mirror EN — StaticTranslationProvider replaces them at runtime via MyMemory API.
// RU translations are finalized.

type Dict = Record<string, Record<Lang, string>>

const T: Dict = {
  // ── Navbar ────────────────────────────────────────────────────────────
  'nav.home':        { en: 'HOME',          ru: 'ГЛАВНАЯ',        am: 'HOME' },
  'nav.catalog':     { en: 'CATALOG',       ru: 'КАТАЛОГ',        am: 'CATALOG' },
  'nav.analytics':   { en: 'ANALYTICS',     ru: 'АНАЛИТИКА',      am: 'ANALYTICS' },
  'nav.consult':     { en: 'CONSULTATION',  ru: 'КОНСУЛЬТАЦИЯ',   am: 'CONSULTATION' },
  'nav.yerevan':     { en: 'Yerevan · Armenia', ru: 'Ереван · Армения', am: 'Yerevan · Armenia' },
  'nav.phone':       { en: 'Phone',         ru: 'Телефон',        am: 'Phone' },

  // ── FilterBar ─────────────────────────────────────────────────────────
  'filter.city':     { en: 'Yerevan',       ru: 'Ереван',         am: 'Yerevan' },
  'filter.search':   { en: 'Search...',     ru: 'Поиск...',       am: 'Search...' },
  'filter.district': { en: 'District',      ru: 'Район',          am: 'District' },
  'filter.developer':{ en: 'Developer',     ru: 'Застройщик',     am: 'Developer' },
  'filter.price':    { en: 'Price: any',    ru: 'Цена: любая',    am: 'Price: any' },
  'filter.price50':  { en: 'up to $50,000', ru: 'до $50 000',     am: 'up to $50,000' },
  'filter.price100': { en: 'up to $100,000',ru: 'до $100 000',    am: 'up to $100,000' },
  'filter.price200': { en: 'up to $200,000',ru: 'до $200 000',    am: 'up to $200,000' },
  'filter.price500': { en: 'up to $500,000',ru: 'до $500 000',    am: 'up to $500,000' },
  'filter.status':   { en: 'Status',        ru: 'Статус',         am: 'Կարգավիճակը' },
  'filter.taxRefund':{ en: 'Tax refund',    ru: 'Возврат налога', am: 'Tax refund' },
  'filter.taxYes':   { en: 'Yes',           ru: 'Есть',           am: 'Yes' },
  'filter.taxNo':    { en: 'No',            ru: 'Нет',            am: 'No' },
  'filter.reset':    { en: 'Reset',         ru: 'Сброс',          am: 'Reset' },
  'page.backToTop':  { en: 'Back to top',   ru: 'Наверх',         am: 'Վերև' },
  'filter.objects':  { en: 'objects',       ru: 'объект',         am: 'objects' },
  'filter.objects2': { en: 'objects',       ru: 'объекта',        am: 'objects' },
  'filter.objectsN': { en: 'objects',       ru: 'объектов',       am: 'objects' },

  // ── PropertyCard ──────────────────────────────────────────────────────
  'card.more':       { en: 'More',          ru: 'Подробнее',      am: 'More' },
  'card.taxRefund':  { en: 'TAX REFUND',    ru: 'ВОЗВРАТ НАЛОГА', am: 'TAX REFUND' },
  'card.yield':      { en: 'Yield',         ru: 'Доходность',     am: 'Yield' },
  'card.area':       { en: 'Area',          ru: 'Площадь',        am: 'Area' },
  'card.district':   { en: 'District',      ru: 'Район',          am: 'District' },
  'card.type':       { en: 'Type',          ru: 'Тип',            am: 'Type' },
  'card.growth':     { en: 'Growth',        ru: 'Рост',           am: 'Growth' },
  'card.from':       { en: 'from',          ru: 'от',             am: 'from' },

  // ── PropertyModal ─────────────────────────────────────────────────────
  'modal.description':     { en: 'Description',      ru: 'Описание',           am: 'Description' },
  'modal.updated':         { en: 'Updated',           ru: 'Обновлено',          am: 'Updated' },
  'modal.developer':       { en: 'Developer',         ru: 'Застройщик',         am: 'Developer' },
  'modal.district':        { en: 'District',          ru: 'Район',              am: 'District' },
  'modal.status':          { en: 'Status',            ru: 'Статус',             am: 'Status' },
  'modal.characteristics': { en: 'Characteristics',   ru: 'Характеристики',     am: 'Characteristics' },
  'modal.unitType':        { en: 'Unit type',         ru: 'Тип объекта',        am: 'Unit type' },
  'modal.minArea':         { en: 'Min. area',         ru: 'Мин. площадь',       am: 'Min. area' },
  'modal.subway':          { en: 'Subway',            ru: 'Метро',              am: 'Subway' },
  'modal.commission':      { en: 'Commission',        ru: 'Комиссия',           am: 'Commission' },
  'modal.contact':         { en: 'Contact',           ru: 'Контакт',            am: 'Contact' },
  'modal.website':         { en: 'Website',           ru: 'Сайт',               am: 'Website' },
  'modal.developer_label': { en: 'DEVELOPER',         ru: 'ЗАСТРОЙЩИК',         am: 'DEVELOPER' },
  'modal.readMore':        { en: 'READ MORE',         ru: 'ЧИТАТЬ ДАЛЕЕ',       am: 'READ MORE' },
  'modal.collapse':        { en: 'COLLAPSE',          ru: 'СВЕРНУТЬ',           am: 'COLLAPSE' },
  'modal.aboutDeveloper':  { en: 'About developer',   ru: 'О застройщике',      am: 'About developer' },
  'modal.nearbyInfra':     { en: 'Nearby infrastructure', ru: 'Инфраструктура рядом', am: 'Nearby infrastructure' },
  'modal.priceChart':      { en: 'Price dynamics',    ru: 'Динамика цен',       am: 'Price dynamics' },
  'modal.overPeriod':      { en: '% over period',     ru: '% за период',        am: '% over period' },
  'modal.onMap':           { en: 'On the map',        ru: 'На карте',           am: 'On the map' },
  'modal.viewPhotos':      { en: 'VIEW ALL PHOTOS AND VIDEOS', ru: 'СМОТРЕТЬ ВСЕ ФОТО И ВИДЕО ПРОЕКТА', am: 'VIEW ALL PHOTOS AND VIDEOS' },
  'modal.downloadPres':    { en: 'DOWNLOAD PRESENTATION', ru: 'СКАЧАТЬ ПРЕЗЕНТАЦИЮ ОБЪЕКТА', am: 'DOWNLOAD PRESENTATION' },
  'modal.getConsult':      { en: 'GET CONSULTATION',  ru: 'ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ', am: 'GET CONSULTATION' },
  'modal.yield':           { en: 'Yield',             ru: 'Доходность',         am: 'Yield' },
  'modal.taxRefund':       { en: 'Tax refund',        ru: 'Возврат налога',     am: 'Tax refund' },
  'modal.yes':             { en: 'Yes',               ru: 'Да',                 am: 'Yes' },
  'modal.no':              { en: 'No',                ru: 'Нет',                am: 'No' },

  // ── Tax Calculator ────────────────────────────────────────────────────
  'tax.title':          { en: 'Tax Calculator',              ru: 'Налоговый калькулятор',        am: 'Tax Calculator' },
  'tax.objParams':      { en: 'Property parameters',         ru: 'Параметры объекта',            am: 'Property parameters' },
  'tax.area':           { en: 'Area',                        ru: 'Площадь',                      am: 'Area' },
  'tax.mortgageParams': { en: 'Mortgage parameters',         ru: 'Параметры ипотеки',            am: 'Mortgage parameters' },
  'tax.loanAmount':     { en: 'Mortgage amount',             ru: 'Сумма ипотеки',                am: 'Mortgage amount' },
  'tax.downPayment':    { en: 'down payment',                ru: 'взнос',                        am: 'down payment' },
  'tax.interestRate':   { en: 'Interest rate',               ru: 'Процентная ставка',            am: 'Interest rate' },
  'tax.perYear':        { en: 'per year',                    ru: 'годовых',                      am: 'per year' },
  'tax.officialSalary': { en: 'Official salary',             ru: 'Официальная зарплата',         am: 'Official salary' },
  'tax.perMonth':       { en: '/month',                      ru: '/мес',                         am: '/month' },
  'tax.results':        { en: 'Results',                     ru: 'Результаты',                   am: 'Results' },
  'tax.incomeTax':      { en: 'Income tax (20%)',            ru: 'Подоходный налог (20%)',        am: 'Income tax (20%)' },
  'tax.monthlyInt':     { en: 'Monthly mortgage interest',   ru: 'Проценты по ипотеке (мес)',    am: 'Monthly mortgage interest' },
  'tax.refundAmt':      { en: 'Refund amount (up to 500k ֏)', ru: 'Сумма возврата (до 500к ֏)', am: 'Refund amount (up to 500k ֏)' },
  'tax.realPayment':    { en: 'Your real interest payment',  ru: 'Ваш реальный платеж по %',     am: 'Your real interest payment' },
  'tax.annualBenefit':  { en: 'Annual benefit',              ru: 'Итоговая выгода за год',        am: 'Annual benefit' },
  'tax.disclaimer':     { en: '* Calculation is approximate. Max refund is capped at 1.5M ֏ per quarter under RA law.', ru: '* Расчет является приблизительным. Максимальный возврат ограничен 1.5 млн ֏ в квартал согласно законодательству РА.', am: '* Calculation is approximate. Max refund is capped at 1.5M ֏ per quarter under RA law.' },

  // ── Payment Plan labels ───────────────────────────────────────────────
  'pay.deposit':     { en: 'Down',         ru: 'Взнос',          am: 'Down' },
  'pay.balance':     { en: 'Balance',      ru: 'Остаток',        am: 'Balance' },
  'pay.booking':     { en: 'Booking',      ru: 'Бронирование',   am: 'Booking' },
  'pay.construction':{ en: 'Construction', ru: 'Строительство',  am: 'Construction' },
  'pay.handover':    { en: 'Handover',     ru: 'Сдача',          am: 'Handover' },
  'pay.stage1':      { en: '1st stage',    ru: '1-й этап',       am: '1st stage' },
  'pay.stage2':      { en: '2nd stage',    ru: '2-й этап',       am: '2nd stage' },
  'pay.stageN':      { en: 'Stage',        ru: 'Этап',           am: 'Stage' },

  // ── Infrastructure labels ─────────────────────────────────────────────
  'infra.metro':     { en: 'Metro',        ru: 'Метро',          am: 'Metro' },
  'infra.park':      { en: 'Park',         ru: 'Парк',           am: 'Park' },
  'infra.school':    { en: 'School',       ru: 'Школа',          am: 'School' },
  'infra.mall':      { en: 'Mall',         ru: 'ТЦ',             am: 'Mall' },
  'infra.university':{ en: 'University',   ru: 'Универ.',        am: 'University' },
  'infra.gym':       { en: 'Gym',          ru: 'Фитнес',         am: 'Gym' },
  'infra.restaurant':{ en: 'Restaurant',   ru: 'Ресторан',       am: 'Restaurant' },
  'infra.min':       { en: 'min',          ru: 'мин',            am: 'min' },

  // ── CatalogPage ───────────────────────────────────────────────────────
  'catalog.home':        { en: '← Home',                        ru: '← Главная',                      am: '← Home' },
  'catalog.title':       { en: 'Catalog',                        ru: 'Каталог',                         am: 'Catalog' },
  'catalog.sortDefault': { en: 'Default',                        ru: 'По умолчанию',                    am: 'Default' },
  'catalog.sortPriceAsc':{ en: 'Price: low to high',             ru: 'Цена: сначала дешевле',           am: 'Գինը՝ ամենացածրը սկզբում' },
  'catalog.sortPriceDesc':{ en: 'Price: high to low',           ru: 'Цена: сначала дороже',            am: 'Գինը՝ ամենաբարձրը սկզբում' },
  'catalog.sortYield':   { en: 'Yield: highest first',           ru: 'Доходность: сначала выше',        am: 'Եկամտաբերություն՝ ամենաբարձրը սկզբում' },
  'catalog.shareWA':     { en: 'SEND SELECTION TO WHATSAPP',     ru: 'ОТПРАВИТЬ ПОДБОРКУ В WHATSAPP',   am: 'SEND SELECTION TO WHATSAPP' },
  'catalog.noFavs':      { en: 'Your favorites list is empty',   ru: 'В вашем списке избранного пока ничего нет', am: 'Your favorites list is empty' },
  'catalog.noItems':     { en: 'No properties match the selected filters', ru: 'Нет объектов по выбранным фильтрам', am: 'No properties match the selected filters' },
  'catalog.showAll':     { en: 'SHOW ALL PROPERTIES',            ru: 'ПОКАЗАТЬ ВСЕ ОБЪЕКТЫ',            am: 'SHOW ALL PROPERTIES' },

  // ── ComparisonModal ───────────────────────────────────────────────────
  'compare.title':   { en: 'Property comparison',          ru: 'Сравнение объектов',           am: 'Property comparison' },
  'compare.ofFour':  { en: 'of 4',                         ru: 'из 4',                         am: 'of 4' },
  'compare.clear':   { en: 'CLEAR',                        ru: 'ОЧИСТИТЬ',                     am: 'CLEAR' },
  'compare.best':    { en: 'BEST',                         ru: 'ЛУЧШЕ',                        am: 'BEST' },
  'compare.priceUSD':{ en: 'Price ($/m²)',                 ru: 'Цена ($/м²)',                  am: 'Price ($/m²)' },
  'compare.priceAMD':{ en: 'Price (֏/m²)',                 ru: 'Цена (֏/м²)',                  am: 'Price (֏/m²)' },
  'compare.district':{ en: 'District',                     ru: 'Район',                        am: 'District' },
  'compare.status':  { en: 'Status',                       ru: 'Статус',                       am: 'Status' },
  'compare.unitType':{ en: 'Unit type',                    ru: 'Тип объекта',                  am: 'Unit type' },
  'compare.yield':   { en: 'Yield',                        ru: 'Доходность',                   am: 'Yield' },
  'compare.taxRefund':{ en: 'Max tax refund\n(mo.)',       ru: 'Макс. возврат\nналога (мес.)', am: 'Max tax refund\n(mo.)' },
  'compare.minArea': { en: 'Min. area',                    ru: 'Мин. площадь',                 am: 'Min. area' },
  'compare.payment': { en: 'Payment plan',                 ru: 'Рассрочка',                    am: 'Payment plan' },
  'compare.subway':  { en: 'Subway',                       ru: 'Метро',                        am: 'Subway' },
  'compare.infra':   { en: 'Infrastructure',               ru: 'Инфраструктура',               am: 'Infrastructure' },
  'compare.upTo':    { en: 'up to',                        ru: 'до',                           am: 'up to' },
  'compare.fromArea':{ en: 'from',                         ru: 'от',                           am: 'from' },
  'compare.hint':    { en: 'Click on a property name to open its details', ru: 'Нажмите на название объекта, чтобы открыть детальную карточку', am: 'Click on a property name to open its details' },

  // ── Hero ──────────────────────────────────────────────────────────────
  'hero.badge':      { en: 'Yerevan · Armenia · 2026',     ru: 'Ереван · Армения · 2026',      am: 'ԵՐԵՎԱՆ · ՀԱՅԱՍՏԱՆ · 2026' },
  'hero.subtitle':   { en: 'Yerevan residential complex aggregator. Up-to-date data on the Armenian real estate market — prices, yields, tax refunds.', ru: 'Агрегатор жилых комплексов Еревана. Актуальные данные о рынке недвижимости Армении — цены, доходность, налоговый возврат.', am: 'Երևանի բնակելի համալիրների ագրեգատոր։ Հայաստանի անշարժ գույքի շուկայի վերաբերյալ վերջին տվյալները, ներառյալ գները, եկամտաբերությունը և հարկերի վերադարձը։' },
  'hero.quote':      { en: '— “Look”. We help you see the real estate market clearly.', ru: '— «Смотри». Мы помогаем видеть рынок недвижимости насквозь.', am: '— «Նայիր»։ Մենք օգնում ենք տեսնել անշառժ գույքի շուկանի ներսից։' },

  // ── MobileTabBar ──────────────────────────────────────────────────────
  'tab.home':        { en: 'HOME',      ru: 'ГЛАВНАЯ',   am: 'HOME' },
  'tab.catalog':     { en: 'CATALOG',   ru: 'КАТАЛОГ',   am: 'CATALOG' },
  'tab.favorites':   { en: 'FAVORITES', ru: 'ИЗБРАННОЕ', am: 'FAVORITES' },
  'tab.compare':     { en: 'COMPARE',   ru: 'СРАВНЕНИЕ', am: 'COMPARE' },

  // ── AnalyticsPage ─────────────────────────────────────────────────────
  'analytics.home':         { en: '← Home',                       ru: '← Главная',                  am: '← Home' },
  'analytics.title':        { en: 'Analytics',                     ru: 'Аналитика',                   am: 'Analytics' },
  'analytics.subtitle':     { en: 'Yerevan real estate market data', ru: 'Данные рынка недвижимости Еревана', am: 'Yerevan real estate market data' },
  'analytics.totalObj':     { en: 'Total properties',              ru: 'Всего объектов',              am: 'Total properties' },
  'analytics.minPrice':     { en: 'Min price/m²',                  ru: 'Мин. цена/м²',                am: 'Min price/m²' },
  'analytics.avgPrice':     { en: 'Avg price/m²',                  ru: 'Средняя цена/м²',             am: 'Avg price/m²' },
  'analytics.maxPrice':     { en: 'Max price/m²',                  ru: 'Макс. цена/м²',               am: 'Max price/m²' },
  'analytics.taxRefund':    { en: 'Tax refund',                    ru: 'Возврат налога',               am: 'Tax refund' },
  'analytics.avgPriceChart':{ en: 'Avg price ($)',                 ru: 'Средняя цена ($)',             am: 'Avg price ($)' },
  'analytics.byDistrict':   { en: 'Average price by district',     ru: 'Средняя цена по районам',     am: 'Average price by district' },
  'analytics.topROI':       { en: 'Top yield',                     ru: 'Топ доходности',               am: 'Top yield' },
  'analytics.perSqm':       { en: '/m²',                           ru: '/м²',                          am: '/m²' },

  // ── StatsRow ──────────────────────────────────────────────────────────
  'stats.projects':  { en: 'projects',    ru: 'проектов',    am: 'projects' },
  'stats.locations': { en: 'locations',   ru: 'локаций',     am: 'locations' },
  'stats.fromPerSqm':{ en: 'from/m²',    ru: 'от/м²',       am: 'from/m²' },
  'stats.taxRefund': { en: 'with refund', ru: 'с возвратом', am: 'with refund' },

  // ── SplitPanel / Map ──────────────────────────────────────────────────
  'map.show':        { en: 'SHOW MAP',     ru: 'ПОКАЗАТЬ НА КАРТЕ', am: 'SHOW MAP' },
  'map.hide':        { en: 'HIDE MAP',     ru: 'СКРЫТЬ КАРТУ',      am: 'HIDE MAP' },
  'map.loading':     { en: 'Loading map…', ru: 'Загрузка карты…',   am: 'Loading map…' },
  'map.details':     { en: 'Details',      ru: 'Подробнее',         am: 'Details' },

  // ── Status values — RU hardcoded; AM auto-translated by StaticTranslationProvider ──
  'status.Ready':              { en: 'Ready',              ru: 'Сдан',               am: 'Ready' },
  'status.Completed':          { en: 'Completed',          ru: 'Завершён',           am: 'Completed' },
  'status.UnderConstruction':  { en: 'Under Construction', ru: 'Строится',           am: 'Under Construction' },
  'status.OffPlan':            { en: 'Off-plan',           ru: 'На стадии проекта',  am: 'Off-plan' },
  'status.Sold':               { en: 'Sold',               ru: 'Продан',             am: 'Sold' },
  'status.PreSale':            { en: 'Pre-sale',           ru: 'Предпродажа',        am: 'Pre-sale' },
  'status.Available':          { en: 'Available',          ru: 'Доступно',           am: 'Available' },

  // ── Yerevan districts — RU hardcoded; AM auto-translated by StaticTranslationProvider ──
  'district.Arabkir':          { en: 'Arabkir',            ru: 'Арабкир',          am: 'Arabkir' },
  'district.Kentron':          { en: 'Kentron',            ru: 'Центр',            am: 'Kentron' },
  'district.KanakerZeytun':    { en: 'Kanaker-Zeytun',     ru: 'Канакер-Зейтун',   am: 'Kanaker-Zeytun' },
  'district.Kanaker':          { en: 'Kanaker',            ru: 'Канакер',          am: 'Kanaker' },
  'district.Zeytun':           { en: 'Zeytun',             ru: 'Зейтун',           am: 'Zeytun' },
  'district.Avan':             { en: 'Avan',               ru: 'Аван',             am: 'Avan' },
  'district.MalatiaSebastia':  { en: 'Malatia-Sebastia',   ru: 'Малатия-Себастия', am: 'Malatia-Sebastia' },
  'district.Malatia':          { en: 'Malatia',            ru: 'Малатия',          am: 'Malatia' },
  'district.Silikyan':         { en: 'Silikyan',           ru: 'Силикян',          am: 'Silikyan' },
  'district.Shengavit':        { en: 'Shengavit',          ru: 'Шенгавит',         am: 'Shengavit' },
  'district.NorNork':          { en: 'Nor Nork',           ru: 'Нор Норк',         am: 'Nor Nork' },
  'district.Erebuni':          { en: 'Erebuni',            ru: 'Эребуни',          am: 'Erebuni' },
  'district.Davtashen':        { en: 'Davtashen',          ru: 'Давташен',         am: 'Davtashen' },
  'district.NorkMarash':       { en: 'Nork-Marash',        ru: 'Норк-Мараш',       am: 'Nork-Marash' },
  'district.Ajapnyak':         { en: 'Ajapnyak',           ru: 'Аджапняк',         am: 'Ajapnyak' },
  'district.Nubarashen':       { en: 'Nubarashen',         ru: 'Нубарашен',        am: 'Nubarashen' },

  // ── Units table ───────────────────────────────────────────────────────
  'units.title':        { en: 'Available Units',  ru: 'Доступные юниты',   am: 'Available Units' },
  'units.summary':      { en: 'Summary',          ru: 'Сводка',            am: 'Summary' },
  'units.total':        { en: 'Total units',       ru: 'Всего юнитов',      am: 'Total units' },
  'units.priceRange':   { en: 'Price range',       ru: 'Диапазон цен',      am: 'Price range' },
  'units.areaRange':    { en: 'Area',              ru: 'Площади',           am: 'Area' },
  'units.filterAll':    { en: 'All',               ru: 'Все',               am: 'Բոլորը' },
  'units.distribution': { en: 'By type',           ru: 'По типам',          am: 'By type' },
  'units.type':   { en: 'Type',             ru: 'Тип',               am: 'Type' },
  'units.area':   { en: 'Area',             ru: 'Площадь',           am: 'Area' },
  'units.price':  { en: 'Price',            ru: 'Цена',              am: 'Price' },
  'units.status': { en: 'Status',           ru: 'Статус',            am: 'Status' },
  'units.floor':  { en: 'Floor',            ru: 'Этаж',              am: 'Floor' },
  'units.free':   { en: 'Available',        ru: 'Свободен',          am: 'Available' },
  'units.booked': { en: 'Reserved',         ru: 'Забронирован',      am: 'Reserved' },
  'units.sold':   { en: 'Sold',             ru: 'Продан',            am: 'Sold' },

  // ── ConsultModal ──────────────────────────────────────────────────────
  'consult.title':    { en: 'Contact us',                                  ru: 'Связаться с нами',                              am: 'Contact us' },
  'consult.subtitle': { en: 'ArmNair · Yerevan · Armenia',                 ru: 'ArmNair · Ереван · Армения',                    am: 'ArmNair · Yerevan · Armenia' },
  'consult.phone':    { en: 'Phone',                                       ru: 'Телефон',                                       am: 'Phone' },
  'consult.footer':   { en: "We'll respond within 15 min · Mon–Sun 9:00–21:00", ru: 'Ответим в течение 15 минут · Пн–Вс 9:00–21:00', am: "We'll respond within 15 min · Mon–Sun 9:00–21:00" },
  'contact.phone':    { en: 'Phone',                                       ru: 'Телефон',                                       am: 'Հեռախոս' },

  // ── Toast notifications ───────────────────────────────────────────────
  'toast.linkCopied':            { en: 'Link copied',           ru: 'Ссылка скопирована',      am: 'Հղումը պատճենված է' },
  'toast.addedToFavorites':      { en: 'Added to favorites',    ru: 'Добавлено в избранное',   am: 'Ավելացված է նախընտրածներին' },
  'toast.removedFromFavorites':  { en: 'Removed from favorites',ru: 'Удалено из избранного',   am: 'Հեռացված է նախընտրածներից' },
  'toast.addedToCompare':        { en: 'Added to compare',      ru: 'Добавлено к сравнению',   am: 'Ավելացված է համեմատությանը' },

  // ── page.tsx ──────────────────────────────────────────────────────────
  'page.footer':     { en: '© 2026 ArmNair · Yerevan · Armenia', ru: '© 2026 ArmNair · Ереван · Армения', am: '© 2026 ArmNair · Yerevan · Armenia' },
  'page.collection': { en: 'YOUR PERSONAL SELECTION FROM ARMNAIR', ru: 'ВАША ПЕРСОНАЛЬНАЯ ПОДБОРКА ОТ ARMNAIR', am: 'YOUR PERSONAL SELECTION FROM ARMNAIR' },
  'page.seeAll':     { en: 'SEE ALL',    ru: 'СМОТРЕТЬ ВСЕ',  am: 'SEE ALL' },
  'page.item':       { en: 'property',   ru: 'объект',         am: 'property' },
  'page.items2':     { en: 'properties', ru: 'объекта',        am: 'properties' },
  'page.items5':     { en: 'properties', ru: 'объектов',       am: 'properties' },
}

export function t(key: string, lang: Lang): string {
  const entry = T[key]
  if (!entry) return key
  return entry[lang] ?? entry['en'] ?? key
}

// Normalize status values → canonical English key suffix (handles both RU and EN sheet values)
const RU_STATUS_NORM: Record<string, string> = {
  'Сдан':                'Ready',
  'Завершён':            'Completed',
  'Строится':            'UnderConstruction',
  'На стадии проекта':   'OffPlan',
  'Продан':              'Sold',
  'Предпродажа':         'PreSale',
  'Доступно':            'Available',
  // EN sheet variants
  'Off-plan':            'OffPlan',
  'Offplan':             'OffPlan',
  'Under Construction':  'UnderConstruction',
  'Pre-sale':            'PreSale',
  'Pre-Sale':            'PreSale',
}

/** Returns the translation key for a status value (handles EN and RU source values) */
export function statusKey(status: string): string {
  const normalized = RU_STATUS_NORM[status.trim()] ?? status.replace(/[\s-]/g, '')
  return `status.${normalized}`
}

/** Returns the translation key for a district name */
export function districtKey(district: string): string {
  return `district.${district.replace(/[\s-]/g, '')}`
}

/** Translate a status string (RU/EN only — use useTStatus() hook for AM) */
export function tStatus(status: string, lang: Lang): string {
  const entry = T[statusKey(status)]
  if (!entry) return status
  // For AM, fall back to English (StaticTranslationProvider caches real Armenian)
  if (lang === 'am') return entry['en'] ?? status
  return entry[lang] ?? status
}

/** Translate a district string (RU/EN only — use useTDistrict() hook for AM) */
export function tDistrict(district: string, lang: Lang): string {
  const entry = T[districtKey(district)]
  if (!entry) return district
  if (lang === 'am') return entry['en'] ?? district
  return entry[lang] ?? district
}

export default T

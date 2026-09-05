import type { Dict } from './types'

export const enums = {
  'orderStatus.NEW': ['Новый', 'Yangi'],
  'orderStatus.CONFIRMED': ['Подтверждён', 'Tasdiqlangan'],
  'orderStatus.SHIPPED': ['Отправлен', 'Joʻnatilgan'],
  'orderStatus.DELIVERED': ['Доставлен', 'Yetkazilgan'],
  'orderStatus.CANCELLED': ['Отменён', 'Bekor qilingan'],

  'paymentStatus.UNPAID': ['Не оплачено', 'Toʻlanmagan'],
  'paymentStatus.PARTIALLY_PAID': ['Частично оплачено', 'Qisman toʻlangan'],
  'paymentStatus.PAID': ['Оплачено', 'Toʻlangan'],
  'paymentStatus.REFUNDED': ['Возвращено', 'Qaytarilgan'],

  'paymentMethod.CASH': ['Наличные', 'Naqd pul'],
  'paymentMethod.CARD': ['Карта', 'Karta'],
  'paymentMethod.CLICK': ['Click', 'Click'],
  'paymentMethod.PAYME': ['Payme', 'Payme'],
  'paymentMethod.BANK_TRANSFER': ['Банковский перевод', 'Bank oʻtkazmasi'],
  'paymentMethod.OTHER': ['Другое', 'Boshqa'],

  'deliveryPayer.CUSTOMER': ['Клиент', 'Mijoz'],
  'deliveryPayer.STORE': ['Магазин', 'Doʻkon'],

  'productStatus.ACTIVE': ['Активен', 'Faol'],
  'productStatus.ARCHIVED': ['В архиве', 'Arxivda'],

  'stockStatus.SUFFICIENT': ['Достаточно', 'Yetarli'],
  'stockStatus.LOW': ['Мало осталось', 'Kam qoldi'],
  'stockStatus.OUT': ['Закончился', 'Tugadi'],

  'movement.INCOMING': ['Приход', 'Kirim'],
  'movement.SALE': ['Продажа', 'Sotuv'],
  'movement.RETURN': ['Возврат', 'Qaytarish'],
  'movement.ADJUSTMENT': ['Корректировка', 'Tuzatish'],

  'adjustmentReason.LOST': ['Утеряно', 'Yoʻqolgan'],
  'adjustmentReason.DAMAGED': ['Повреждено', 'Shikastlangan'],
  'adjustmentReason.MISCOUNTED': ['Ошибочно учтено', 'Xato hisoblangan'],
  'adjustmentReason.OTHER': ['Другое', 'Boshqa'],

  'role.OWNER': ['Владелец', 'Egasi'],
  'role.MANAGER': ['Менеджер', 'Menejer'],

  'datePreset.today': ['Сегодня', 'Bugun'],
  'datePreset.yesterday': ['Вчера', 'Kecha'],
  'datePreset.last7': ['Последние 7 дней', 'Soʻnggi 7 kun'],
  'datePreset.last30': ['Последние 30 дней', 'Soʻnggi 30 kun'],
  'datePreset.thisMonth': ['Этот месяц', 'Shu oy'],
  'datePreset.lastMonth': ['Прошлый месяц', 'Oʻtgan oy'],
  'datePreset.custom': ['Свой диапазон', 'Oʻz oraligʻi'],

  'expensePreset.ads': ['Реклама', 'Reklama'],
  'expensePreset.content': ['Контент', 'Kontent'],
  'expensePreset.photo': ['Фото/видео', 'Foto/video'],
  'expensePreset.rent': ['Аренда', 'Ijara'],
  'expensePreset.software': ['Программы (подписки)', 'Dasturlar (obunalar)'],
  'expensePreset.other': ['Прочие расходы', 'Boshqa xarajatlar'],
} satisfies Dict

@component('mail::message')
# Hvala na kupovini!

Vaša narudžbina **#{{ $order->id }}** je uspešno kreirana.

@component('mail::panel')
**Kupac:** {{ $order->customer_name }}  
**Email:** {{ $order->customer_email }}  
**Datum:** {{ optional($order->created_at)->format('d.m.Y H:i') }}
@endcomponent

@component('mail::table')
| Proizvod | Količina | Cena | Ukupno |
|:--|:--:|--:|--:|
@foreach($order->items as $it)
| {{ $it->name }} | {{ $it->quantity }} | € {{ number_format($it->price, 2) }} | € {{ number_format($it->line_total, 2) }} |
@endforeach
@endcomponent

**Ukupno za naplatu:** € {{ number_format($order->total_price, 2) }}

@component('mail::button', ['url' => config('app.url')])
Poseti sajt
@endcomponent

Srdačno,  
{{ config('app.name') }}
@endcomponent

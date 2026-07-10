<template>
<section id="top" style="position:relative;padding:132px 24px 64px;overflow:hidden;background:radial-gradient(1200px 700px at 12% -8%,rgba(59,130,246,.22),transparent 60%),radial-gradient(1000px 620px at 100% 0%,rgba(34,197,94,.12),transparent 55%),#070E20">
  <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(148,163,184,.09) 1px,transparent 1px);background-size:34px 34px;-webkit-mask-image:linear-gradient(to bottom,#000,transparent 80%);mask-image:linear-gradient(to bottom,#000,transparent 80%);pointer-events:none"></div>
  <div style="position:absolute;top:6%;left:-7%;width:540px;height:540px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.20),transparent 62%);filter:blur(20px);pointer-events:none"></div>
  <div style="max-width:1280px;margin:0 auto;position:relative">
    <div class="r-hero" style="display:grid;grid-template-columns:1.08fr .92fr;gap:40px;align-items:center">
      <!-- Left -->
      <div class="vb-reveal">
        <h1 style="font-size:57px;line-height:1.04;font-weight:600;letter-spacing:-.03em;color:#fff;margin-bottom:20px">Centralisez,<br><span style="background:linear-gradient(100deg,#5C9CFF,#23C4A8);-webkit-background-clip:text;background-clip:text;color:transparent">organisez, valorisez.</span></h1>
        <p style="font-size:18px;line-height:1.6;color:#A5B0C6;max-width:520px;margin-bottom:30px">Verebona organise vos documents, informations et échéances pour les retrouver facilement, anticiper les dates importantes et valoriser vos biens le moment venu.</p>
        <div class="r-2" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 28px;max-width:540px;margin-bottom:32px">
          <div style="display:flex;gap:10px"><span style="width:6px;height:6px;border-radius:50%;background:#3B82F6;margin-top:8px;flex-shrink:0"></span><div><div style="font-weight:600;color:#EAF0FB;font-size:14.5px">Retrouvez vite ce qui compte</div><div style="color:#8390A8;font-size:13px;line-height:1.5">Contrats, garanties, diagnostics au bon endroit.</div></div></div>
          <div style="display:flex;gap:10px"><span style="width:6px;height:6px;border-radius:50%;background:#3B82F6;margin-top:8px;flex-shrink:0"></span><div><div style="font-weight:600;color:#EAF0FB;font-size:14.5px">Anticipez les dates importantes</div><div style="color:#8390A8;font-size:13px;line-height:1.5">Assurances, contrôles et entretiens au bon moment.</div></div></div>
          <div style="display:flex;gap:10px"><span style="width:6px;height:6px;border-radius:50%;background:#3B82F6;margin-top:8px;flex-shrink:0"></span><div><div style="font-weight:600;color:#EAF0FB;font-size:14.5px">Suivez l'histoire de vos biens</div><div style="color:#8390A8;font-size:13px;line-height:1.5">Un historique clair qui se construit dans le temps.</div></div></div>
          <div style="display:flex;gap:10px"><span style="width:6px;height:6px;border-radius:50%;background:#3B82F6;margin-top:8px;flex-shrink:0"></span><div><div style="font-weight:600;color:#EAF0FB;font-size:14.5px">Valorisez-les le moment venu</div><div style="color:#8390A8;font-size:13px;line-height:1.5">Vente, assurance ou transmission mieux documentées.</div></div></div>
        </div>
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <a href="#pricing" style="font-size:16px;font-weight:600;color:#fff;padding:14px 26px;border-radius:999px;background:linear-gradient(135deg,#00D4AA,#00A882);box-shadow:0 16px 36px rgba(0,180,140,.4);transition:transform .15s" v-hover="{transform:'translateY(-2px)'}">Commencez par 2 mois offerts</a>
          <span style="font-size:13px;color:#8390A8;max-width:190px;line-height:1.4">Aucun paiement aujourd'hui, carte bancaire requise.</span>
        </div>
      </div>
      <!-- Right : mascotte welcome-wave -->
      <template v-if="showMascot">
      <div class="vb-reveal" style="transition-delay:.12s;position:relative;display:flex;justify-content:center;align-items:center">
        <div style="position:absolute;width:580px;height:580px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.34),transparent 62%);filter:blur(10px)"></div>
        <img src="/assets/mascot/welcome-wave.webp" alt="Verebona vous accueille" style="position:relative;width:min(400px,90%);height:auto;filter:drop-shadow(0 30px 50px rgba(4,10,26,.6));animation:vb-float 6s ease-in-out infinite"/>
      </div>
      </template>
    </div>

    <!-- Triptych strip -->
    <div class="vb-rgroup r-tri" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:44px">
      <div style="display:flex;align-items:center;gap:18px;padding:20px 22px;border-radius:18px;background:rgba(15,23,42,.5);border:1px solid rgba(148,163,184,.14)">
        <div style="width:60px;height:60px;border-radius:16px;background:rgba(59,130,246,.14);border:1px solid rgba(59,130,246,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#7EB0FF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.7 12 3l9 7.7"/><path d="M5 9.6V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.6"/><path d="M9.5 21v-6.2h5V21"/></svg>
        </div>
        <div>
          <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:19px;color:#fff;letter-spacing:-.01em;margin-bottom:3px">Biens</div>
          <div style="font-size:13.5px;color:#8FA0BB">Logements, véhicules, objets</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:18px;padding:20px 22px;border-radius:18px;background:rgba(15,23,42,.5);border:1px solid rgba(148,163,184,.14)">
        <div style="width:60px;height:60px;border-radius:16px;background:rgba(139,92,246,.14);border:1px solid rgba(139,92,246,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#B49BFF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h6l4 4v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 16.5h4"/></svg>
        </div>
        <div>
          <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:19px;color:#fff;letter-spacing:-.01em;margin-bottom:3px">Documents</div>
          <div style="font-size:13.5px;color:#8FA0BB">Factures, garanties, contrats…</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:18px;padding:20px 22px;border-radius:18px;background:rgba(15,23,42,.5);border:1px solid rgba(148,163,184,.14)">
        <div style="width:60px;height:60px;border-radius:16px;background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#6EE7A3" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 3v4M16 3v4"/><circle cx="8.5" cy="14" r="1.1" fill="#6EE7A3" stroke="none"/><circle cx="12" cy="14" r="1.1" fill="#6EE7A3" stroke="none"/><circle cx="15.5" cy="14" r="1.1" fill="#6EE7A3" stroke="none"/></svg>
        </div>
        <div>
          <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:19px;color:#fff;letter-spacing:-.01em;margin-bottom:3px">Agendas</div>
          <div style="font-size:13.5px;color:#8FA0BB">Échéances, entretiens, rappels…</div>
        </div>
      </div>
    </div>

    <!-- App mockup -->
    <template v-if="showMockup">
    <div class="vb-reveal" style="margin-top:64px">
      <div style="text-align:center;max-width:660px;margin:0 auto 30px">
        <h2 style="font-size:29px;font-weight:600;letter-spacing:-.02em;color:#fff;line-height:1.15;margin-bottom:11px">Emmenez Verebona partout avec vous</h2>
        <p style="font-size:16px;line-height:1.6;color:#95A1B8">Sur ordinateur ou sur mobile, retrouvez vos biens, vos documents et vos échéances où que vous soyez — toujours synchronisés.</p>
      </div>
      <div class="r-mock" style="display:flex;gap:22px;align-items:flex-end">
      <div class="r-browser" style="flex:1;min-width:0;display:flex;flex-direction:column;align-items:center">
       <div style="width:92%;background:#0A0E17;padding:9px 9px 10px;border-radius:16px;border:1px solid rgba(132,144,168,.28);box-shadow:0 42px 82px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.03)">
        <div style="display:flex;justify-content:center;padding-bottom:7px"><span style="width:6px;height:6px;border-radius:50%;background:#141A26;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.16)"></span></div>
        <div style="border-radius:6px;overflow:hidden;background:rgba(15,23,42,.96)">
        <div style="display:flex;align-items:center;gap:10px;padding:11px 16px;border-bottom:1px solid rgba(31,41,55,.9);background:rgba(9,14,28,.98)">
          <div style="display:flex;gap:7px"><span style="width:11px;height:11px;border-radius:50%;background:rgba(239,68,68,.7)"></span><span style="width:11px;height:11px;border-radius:50%;background:rgba(245,158,11,.7)"></span><span style="width:11px;height:11px;border-radius:50%;background:rgba(34,197,94,.7)"></span></div>
          <div style="flex:1;display:flex;justify-content:center"><div style="padding:3px 14px;border-radius:6px;background:rgba(31,41,55,.8);font-size:11px;color:#64748B">app.verebona.com</div></div>
          <span style="font-size:11px;color:#64748B">{{ slideLabel }}</span>
        </div>
        <div style="display:flex;height:440px;background:#020617">
          <!-- sidebar -->
          <div style="width:210px;flex-shrink:0;border-right:1px solid rgba(31,41,55,.6);background:rgba(15,23,42,.25);padding:16px 12px;display:flex;flex-direction:column;gap:5px">
            <div style="display:flex;align-items:center;gap:9px;padding:0 6px;margin-bottom:16px">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style="overflow:visible"><rect x="0" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="0" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="0" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="-1.55" width="9.14" height="9.14" rx="1.6" fill="#2F6BFF" transform="rotate(18 27.43 3.02)"/></svg>
              <span style="font-size:13px;font-weight:600;color:#E2E8F0">Verebona</span>
            </div>
            <button type="button" :style="nav[0].style" @click.prevent="nav[0].onClick"><span style="width:15px;height:15px;border-radius:4px;border:2px solid currentColor;opacity:.9"></span>Accueil</button>
            <button type="button" :style="nav[1].style" @click.prevent="nav[1].onClick"><span style="width:15px;height:15px;border-radius:3px;border:2px solid currentColor;opacity:.9"></span>Mes biens</button>
            <button type="button" :style="nav[2].style" @click.prevent="nav[2].onClick"><span style="width:15px;height:15px;border-radius:4px;border:2px solid currentColor;opacity:.9"></span>Mes événements</button>
            <button type="button" :style="nav[3].style" @click.prevent="nav[3].onClick"><span style="width:15px;height:15px;border-radius:4px;border:2px solid currentColor;opacity:.9"></span>Mes documents</button>
            <div style="display:flex;align-items:center;gap:11px;padding:9px 12px;border-radius:10px;font-size:12px;font-weight:600;color:#8892A6"><span style="width:15px;height:15px;border-radius:4px;border:2px solid currentColor;opacity:.9"></span>Mes rappels</div>
          </div>
          <!-- main -->
          <div style="flex:1;display:flex;flex-direction:column;min-width:0">
            <div style="height:48px;flex-shrink:0;border-bottom:1px solid rgba(31,41,55,.6);display:flex;align-items:center;padding:0 18px;gap:12px">
              <div style="flex:1;max-width:240px;height:30px;border-radius:999px;background:rgba(15,23,42,.6);border:1px solid rgba(31,41,55,.7);display:flex;align-items:center;padding:0 14px;font-size:11.5px;color:#64748B">Rechercher…</div>
              <div style="margin-left:auto;width:28px;height:28px;border-radius:50%;background:#1E293B;border:1px solid rgba(71,85,105,.6);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#CBD5E1">LM</div>
            </div>
            <div style="flex:1;overflow:hidden;padding:22px">
              <!-- Dashboard -->
              <template v-if="isDashboard">
              <div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px">
                  <div style="padding:13px;border-radius:12px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:9px;background:rgba(59,130,246,.12);color:#60A5FA;display:flex;align-items:center;justify-content:center;font-weight:700">◱</div><div><div style="font-size:10px;color:#64748B;text-transform:uppercase;font-weight:600">Mes biens</div><div style="font-size:19px;font-weight:700;color:#E2E8F0">3</div></div></div>
                  <div style="padding:13px;border-radius:12px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:9px;background:rgba(245,158,11,.12);color:#FBBF24;display:flex;align-items:center;justify-content:center;font-weight:700">◷</div><div><div style="font-size:10px;color:#64748B;text-transform:uppercase;font-weight:600">Événements</div><div style="font-size:19px;font-weight:700;color:#E2E8F0">2</div></div></div>
                  <div style="padding:13px;border-radius:12px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:9px;background:rgba(34,197,94,.12);color:#4ADE80;display:flex;align-items:center;justify-content:center;font-weight:700">▤</div><div><div style="font-size:10px;color:#64748B;text-transform:uppercase;font-weight:600">Documents</div><div style="font-size:19px;font-weight:700;color:#E2E8F0">16</div></div></div>
                  <div style="padding:13px;border-radius:12px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:9px;background:rgba(239,68,68,.12);color:#F87171;display:flex;align-items:center;justify-content:center;font-weight:700">!</div><div><div style="font-size:10px;color:#64748B;text-transform:uppercase;font-weight:600">À traiter</div><div style="font-size:19px;font-weight:700;color:#E2E8F0">0</div></div></div>
                </div>
                <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Mes rappels</div>
                <div style="position:relative;padding:12px 14px 12px 18px;border-radius:12px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:12px;margin-bottom:18px;overflow:hidden">
                  <span style="position:absolute;left:0;top:0;bottom:0;width:4px;background:#EF4444"></span>
                  <div style="width:36px;height:36px;border-radius:9px;background:#1E293B;display:flex;align-items:center;justify-content:center;color:#94A3B8">⚙</div>
                  <div style="flex:1"><div style="font-size:12px;font-weight:600;color:#E2E8F0">Révision annuelle</div><div style="font-size:10.5px;color:#64748B">Il y a 2 jours • Vélo Cargo Électrique</div></div>
                  <span style="font-size:10px;padding:3px 9px;border-radius:6px;background:rgba(239,68,68,.14);color:#F87171;border:1px solid rgba(239,68,68,.3)">En retard (2 j)</span>
                </div>
                <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Mes biens</div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
                  <div style="border-radius:12px;overflow:hidden;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6)"><div style="height:74px;background:#020617"><img src="/assets/appartement-lyon.jpg" alt="Appartement Lyon" style="width:100%;height:100%;object-fit:cover;opacity:.85"/></div><div style="padding:9px"><div style="font-size:11.5px;font-weight:700;color:#E2E8F0">Appartement Lyon</div><div style="font-size:10px;color:#64748B">Immobilier • 7 docs</div></div></div>
                  <div style="border-radius:12px;overflow:hidden;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6)"><div style="height:74px;background:#020617"><img src="/assets/velo-cargo.jpg" alt="Vélo Cargo" style="width:100%;height:100%;object-fit:cover;opacity:.85"/></div><div style="padding:9px"><div style="font-size:11.5px;font-weight:700;color:#E2E8F0">Vélo Cargo</div><div style="font-size:10px;color:#64748B">Véhicule • 6 docs</div></div></div>
                  <div style="border-radius:12px;overflow:hidden;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6)"><div style="height:74px;background:#020617"><img src="/assets/surf-personal.png" alt="Planche de Surf" style="width:100%;height:100%;object-fit:cover;opacity:.85"/></div><div style="padding:9px"><div style="font-size:11.5px;font-weight:700;color:#E2E8F0">Planche de Surf</div><div style="font-size:10px;color:#64748B">Loisir • 3 docs</div></div></div>
                </div>
              </div>
              </template>
              <!-- Biens -->
              <template v-if="isBiens">
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-size:14px;font-weight:700;color:#E2E8F0">Mes biens</div><div style="display:flex;gap:7px;font-size:11px"><span style="padding:3px 11px;border-radius:999px;background:rgba(37,99,235,.2);border:1px solid rgba(59,130,246,.3);color:#93C5FD">Tout</span><span style="padding:3px 11px;border-radius:999px;border:1px solid rgba(71,85,105,.5);color:#64748B">Actif</span><span style="padding:3px 11px;border-radius:999px;border:1px solid rgba(71,85,105,.5);color:#64748B">Archivé</span></div></div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
                  <div style="border-radius:12px;overflow:hidden;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6)"><div style="height:120px;background:#020617"><img src="/assets/appartement-lyon.jpg" alt="Appartement Lyon" style="width:100%;height:100%;object-fit:cover;opacity:.85"/></div><div style="padding:11px"><div style="font-size:12.5px;font-weight:700;color:#E2E8F0">Appartement Lyon</div><div style="font-size:10.5px;color:#64748B;margin-bottom:5px">Immobilier • T3</div><div style="font-size:10px;color:#64748B">▤ 7 documents</div></div></div>
                  <div style="border-radius:12px;overflow:hidden;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6)"><div style="height:120px;background:#020617"><img src="/assets/velo-cargo.jpg" alt="Vélo Cargo" style="width:100%;height:100%;object-fit:cover;opacity:.85"/></div><div style="padding:11px"><div style="font-size:12.5px;font-weight:700;color:#E2E8F0">Vélo Cargo</div><div style="font-size:10.5px;color:#64748B;margin-bottom:5px">Véhicule • Électrique</div><div style="font-size:10px;color:#64748B">▤ 6 documents • 2 évén.</div></div></div>
                  <div style="border-radius:12px;overflow:hidden;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6)"><div style="height:120px;background:#020617"><img src="/assets/surf-personal.png" alt="Planche de Surf" style="width:100%;height:100%;object-fit:cover;opacity:.85"/></div><div style="padding:11px"><div style="font-size:12.5px;font-weight:700;color:#E2E8F0">Planche de Surf</div><div style="font-size:10.5px;color:#64748B;margin-bottom:5px">Sport / Loisir</div><div style="font-size:10px;color:#64748B">▤ 3 documents</div></div></div>
                </div>
              </div>
              </template>
              <!-- Events -->
              <template v-if="isEvents">
              <div>
                <div style="display:flex;gap:8px;font-size:11px;margin-bottom:14px"><span style="padding:4px 12px;border-radius:999px;background:rgba(37,99,235,.2);border:1px solid rgba(59,130,246,.3);color:#93C5FD">Tout</span><span style="padding:4px 12px;border-radius:999px;border:1px solid rgba(71,85,105,.5);color:#64748B">À venir</span><span style="padding:4px 12px;border-radius:999px;border:1px solid rgba(71,85,105,.5);color:#64748B">En retard</span></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:34px;height:34px;border-radius:9px;background:rgba(239,68,68,.1);color:#F87171;display:flex;align-items:center;justify-content:center">◷</div><div style="flex:1"><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Révision annuelle</div><div style="font-size:10px;color:#64748B">Vélo Cargo • Il y a 2 jours</div></div><span style="font-size:9px;padding:2px 7px;border-radius:5px;color:#F87171;border:1px solid rgba(239,68,68,.3)">En retard</span></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:34px;height:34px;border-radius:9px;background:rgba(245,158,11,.1);color:#FBBF24;display:flex;align-items:center;justify-content:center">◷</div><div style="flex:1"><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Contrôle technique</div><div style="font-size:10px;color:#64748B">Voiture familiale • Dans 12 j</div></div><span style="font-size:9px;padding:2px 7px;border-radius:5px;color:#FBBF24;border:1px solid rgba(245,158,11,.3)">À venir</span></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:34px;height:34px;border-radius:9px;background:rgba(34,197,94,.1);color:#4ADE80;display:flex;align-items:center;justify-content:center">◷</div><div style="flex:1"><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Renouvellement bail</div><div style="font-size:10px;color:#64748B">Appartement Lyon • Dans 3 mois</div></div><span style="font-size:9px;padding:2px 7px;border-radius:5px;color:#4ADE80;border:1px solid rgba(34,197,94,.3)">À venir</span></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:34px;height:34px;border-radius:9px;background:rgba(34,197,94,.1);color:#4ADE80;display:flex;align-items:center;justify-content:center">◷</div><div style="flex:1"><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Assurance habitation</div><div style="font-size:10px;color:#64748B">Appartement Lyon • Dans 4 mois</div></div><span style="font-size:9px;padding:2px 7px;border-radius:5px;color:#4ADE80;border:1px solid rgba(34,197,94,.3)">À venir</span></div>
                </div>
              </div>
              </template>
              <!-- Docs -->
              <template v-if="isDocs">
              <div>
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><div style="flex:1;max-width:240px;height:30px;border-radius:999px;background:rgba(15,23,42,.6);border:1px solid rgba(31,41,55,.7);display:flex;align-items:center;padding:0 14px;font-size:11px;color:#64748B">Rechercher un document…</div><div style="display:flex;gap:6px;font-size:10px"><span style="padding:3px 10px;border-radius:999px;background:rgba(37,99,235,.2);border:1px solid rgba(59,130,246,.3);color:#93C5FD">Tout</span><span style="padding:3px 10px;border-radius:999px;border:1px solid rgba(71,85,105,.5);color:#64748B">Facture</span><span style="padding:3px 10px;border-radius:999px;border:1px solid rgba(71,85,105,.5);color:#64748B">Notice</span></div></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.12);color:#60A5FA;display:flex;align-items:center;justify-content:center">▤</div><div><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Facture achat vélo</div><div style="font-size:9.5px;color:#64748B">Facture · Vélo Cargo · 12/03/2024</div></div></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,.12);color:#4ADE80;display:flex;align-items:center;justify-content:center">▤</div><div><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Attestation assurance</div><div style="font-size:9.5px;color:#64748B">Assurance · Appart. Lyon · 01/01/2025</div></div></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:8px;background:rgba(139,92,246,.12);color:#A78BFA;display:flex;align-items:center;justify-content:center">▤</div><div><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Notice technique</div><div style="font-size:9.5px;color:#64748B">Notice · Vélo Cargo · 12/03/2024</div></div></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:8px;background:rgba(245,158,11,.12);color:#FBBF24;display:flex;align-items:center;justify-content:center">▤</div><div><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Contrat de bail</div><div style="font-size:9.5px;color:#64748B">Contrat · Appart. Lyon · 15/09/2023</div></div></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:8px;background:rgba(59,130,246,.12);color:#60A5FA;display:flex;align-items:center;justify-content:center">▤</div><div><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">Facture planche surf</div><div style="font-size:9.5px;color:#64748B">Facture · Planche · 05/06/2023</div></div></div>
                  <div style="padding:11px;border-radius:11px;background:rgba(15,23,42,.5);border:1px solid rgba(31,41,55,.6);display:flex;align-items:center;gap:11px"><div style="width:32px;height:32px;border-radius:8px;background:rgba(148,163,184,.12);color:#94A3B8;display:flex;align-items:center;justify-content:center">▤</div><div><div style="font-size:11.5px;font-weight:600;color:#E2E8F0">PV remise des clés</div><div style="font-size:9.5px;color:#64748B">Admin · Appart. Lyon · 15/09/2023</div></div></div>
                </div>
              </div>
              </template>
            </div>
          </div>
        </div>
        </div>
       </div>
       <div style="width:100%;height:14px;position:relative;background:linear-gradient(180deg,#C8CFDA 0%,#A2ABB8 44%,#7C8492 100%);border-radius:3px 3px 11px 11px;box-shadow:0 34px 50px rgba(0,0,0,.5),inset 0 1.5px 0 rgba(255,255,255,.65)">
        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:132px;height:8px;background:linear-gradient(180deg,#6B7280,#889099);border-radius:0 0 9px 9px"></div>
       </div>
      </div>
        <!-- phone -->
        <div style="flex-shrink:0;width:246px;border-radius:50px;padding:6px;background:linear-gradient(150deg,#39414F,#0A101B);border:1px solid rgba(140,152,175,.3);box-shadow:0 46px 82px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.12)">
          <div style="position:relative;border-radius:44px;overflow:hidden;background:#020617;height:486px;display:flex;flex-direction:column">
            <div style="position:absolute;top:12px;left:50%;transform:translateX(-50%);width:86px;height:25px;background:#000;border-radius:15px;z-index:6;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)"></div>
            <div style="height:46px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:8px 20px 0 22px;position:relative;z-index:5">
              <span style="font-size:12.5px;font-weight:700;color:#E2E8F0;letter-spacing:.01em">9:41</span>
              <span style="display:flex;align-items:center;gap:6px">
                <span style="display:flex;align-items:flex-end;gap:2px;height:11px"><i style="width:3px;height:4px;background:#E2E8F0;border-radius:1px"></i><i style="width:3px;height:6px;background:#E2E8F0;border-radius:1px"></i><i style="width:3px;height:8.5px;background:#E2E8F0;border-radius:1px"></i><i style="width:3px;height:11px;background:#E2E8F0;border-radius:1px"></i></span>
                <svg width="16" height="11" viewBox="0 0 16 12" fill="none"><path d="M1.4 4.1a10 10 0 0 1 13.2 0" stroke="#E2E8F0" stroke-width="1.5" stroke-linecap="round"/><path d="M4 6.8a6 6 0 0 1 8 0" stroke="#E2E8F0" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="9.7" r="1.1" fill="#E2E8F0"/></svg>
                <span style="display:flex;align-items:center;gap:2px"><span style="width:22px;height:11px;border-radius:3px;border:1.3px solid rgba(226,232,240,.5);padding:1.5px;display:flex;align-items:stretch"><span style="width:72%;background:#E2E8F0;border-radius:1.5px"></span></span><span style="width:1.6px;height:4px;background:rgba(226,232,240,.5);border-radius:0 2px 2px 0"></span></span>
              </span>
            </div>
            <div style="padding:6px 16px 14px;display:flex;flex-direction:column;gap:11px;overflow:hidden;flex:1">
              <div style="display:flex;align-items:center;gap:8px">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" style="overflow:visible"><rect x="0" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="0" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="0" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="11.43" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="0" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="11.43" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="22.86" width="9.14" height="9.14" rx="1.6" fill="#fff"/><rect x="22.86" y="-1.55" width="9.14" height="9.14" rx="1.6" fill="#2F6BFF" transform="rotate(18 27.43 3.02)"/></svg>
                <span style="font-size:13px;font-weight:700;color:#E2E8F0;font-family:'Bricolage Grotesque',sans-serif">Verebona</span>
              </div>
              <div style="font-size:15px;font-weight:700;color:#fff;font-family:'Bricolage Grotesque',sans-serif">Bonjour, Léa</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div style="padding:10px;border-radius:12px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25)"><div style="font-size:9px;color:#93A2BD;text-transform:uppercase;letter-spacing:.05em">Biens</div><div style="font-size:18px;font-weight:700;color:#E2E8F0">3</div></div>
                <div style="padding:10px;border-radius:12px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25)"><div style="font-size:9px;color:#93A2BD;text-transform:uppercase;letter-spacing:.05em">À traiter</div><div style="font-size:18px;font-weight:700;color:#E2E8F0">1</div></div>
              </div>
              <div style="position:relative;padding:11px 12px 11px 15px;border-radius:12px;background:rgba(15,23,42,.7);border:1px solid rgba(239,68,68,.25);overflow:hidden">
                <span style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#EF4444"></span>
                <div style="font-size:11px;font-weight:600;color:#E2E8F0">Révision annuelle</div>
                <div style="font-size:9.5px;color:#F87171">En retard · Vélo Cargo</div>
              </div>
              <div style="font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.05em">Mes biens</div>
              <div style="display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:11px;background:rgba(15,23,42,.6);border:1px solid rgba(31,41,55,.7)"><div style="width:38px;height:38px;border-radius:9px;overflow:hidden;flex-shrink:0"><img src="/assets/appartement-lyon.jpg" alt="" style="width:100%;height:100%;object-fit:cover"/></div><div><div style="font-size:11px;font-weight:600;color:#E2E8F0">Appartement Lyon</div><div style="font-size:9px;color:#64748B">7 documents</div></div></div>
                <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:11px;background:rgba(15,23,42,.6);border:1px solid rgba(31,41,55,.7)"><div style="width:38px;height:38px;border-radius:9px;overflow:hidden;flex-shrink:0"><img src="/assets/velo-cargo.jpg" alt="" style="width:100%;height:100%;object-fit:cover"/></div><div><div style="font-size:11px;font-weight:600;color:#E2E8F0">Vélo Cargo</div><div style="font-size:9px;color:#64748B">6 documents · 2 évén.</div></div></div>
              </div>
              <div style="margin-top:auto;display:flex;align-items:center;justify-content:space-around;padding:11px 6px 3px;border-top:1px solid rgba(31,41,55,.6)">
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.7V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.7"/></svg>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#5A657A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#5A657A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/></svg>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#5A657A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2.5H7A2 2 0 0 0 5 4.5v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5Z"/><path d="M14 2.5v5h5"/></svg>
              </div>
              <div style="display:flex;justify-content:center;padding-bottom:7px"><span style="width:104px;height:4px;border-radius:3px;background:rgba(226,232,240,.45)"></span></div>
            </div>
          </div>
        </div>
      </div>
      <!-- nav dots -->
      <div class="r-dots" style="display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px">
        <button type="button" @click.prevent="prev" style="width:30px;height:30px;border-radius:50%;border:1px solid rgba(71,85,105,.6);background:rgba(15,23,42,.6);color:#94A3B8;cursor:pointer;font-size:15px">‹</button>
        <div style="display:flex;gap:7px;align-items:center">
          <button type="button" :style="dots[0].style" @click.prevent="dots[0].onClick"></button>
          <button type="button" :style="dots[1].style" @click.prevent="dots[1].onClick"></button>
          <button type="button" :style="dots[2].style" @click.prevent="dots[2].onClick"></button>
          <button type="button" :style="dots[3].style" @click.prevent="dots[3].onClick"></button>
        </div>
        <button type="button" @click.prevent="next" style="width:30px;height:30px;border-radius:50%;border:1px solid rgba(71,85,105,.6);background:rgba(15,23,42,.6);color:#94A3B8;cursor:pointer;font-size:15px">›</button>
      </div>
    </div>
    </template>
  </div>
</section>
</template>

<script setup lang="ts">
import { useLanding } from '../composables/useLanding'
const { showMascot, showMockup, slideLabel, nav, dots, isDashboard, isBiens, isEvents, isDocs, prev, next } = useLanding()
</script>

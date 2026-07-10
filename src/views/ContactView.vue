<template>
<section style="position:relative;padding:128px 24px 56px;overflow:hidden;background:radial-gradient(1100px 620px at 85% -10%,rgba(34,197,94,.14),transparent 58%),radial-gradient(900px 560px at 10% 0,rgba(59,130,246,.2),transparent 60%),#070E20">
  <div style="position:absolute;inset:0;background-image:radial-gradient(rgba(148,163,184,.09) 1px,transparent 1px);background-size:34px 34px;-webkit-mask-image:linear-gradient(to bottom,#000,transparent 85%);mask-image:linear-gradient(to bottom,#000,transparent 85%);pointer-events:none"></div>
  <div style="max-width:1180px;margin:0 auto;position:relative">
    <nav aria-label="Fil d'Ariane" style="margin-bottom:24px"><ol style="display:flex;align-items:center;gap:6px;list-style:none;margin:0;padding:0;font-size:13.5px"><li style="display:flex;align-items:center"><a href="#" @click.prevent="goHome" style="display:inline-flex;align-items:center;gap:7px;color:#9FB4D8;font-weight:500;padding:6px 11px;border-radius:9px;cursor:pointer;transition:color .15s,background .15s" v-hover="{color:'#fff',background:'rgba(255,255,255,.06)'}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg>Accueil</a></li><li aria-hidden="true" style="display:flex;color:#42557A"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></li><li aria-current="page" style="color:#EAF0FB;font-weight:600;padding:6px 4px">{{ crumbLabel }}</li></ol></nav>
    <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#8FBEFF;margin-bottom:16px">Contact</div>
    <h1 style="font-size:46px;line-height:1.06;font-weight:600;letter-spacing:-.025em;color:#fff;max-width:640px">Parlons de votre patrimoine</h1>
    <p style="font-size:17px;line-height:1.6;color:#A5B0C6;max-width:560px;margin-top:16px">Une question, une suggestion, un partenariat ? Écrivez-nous, nous revenons vers vous rapidement.</p>
  </div>
</section>
<section style="background:#F6F8FC;padding:56px 24px 72px">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;gap:36px;align-items:start" class="r-contact">
    <div style="background:#fff;border:1px solid #E6EBF3;border-radius:22px;padding:32px 30px;box-shadow:0 12px 34px rgba(15,27,51,.06)">
      <template v-if="contactSent">
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:30px 10px">
          <div style="width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.12);display:flex;align-items:center;justify-content:center;margin-bottom:18px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
          <div style="font-size:21px;font-weight:700;color:#0F1B33;font-family:'Bricolage Grotesque',sans-serif">Message envoyé</div>
          <div style="font-size:15px;color:#64748B;margin-top:8px;max-width:340px">Merci ! Notre équipe vous répond sous 24&nbsp;h ouvrées à l'adresse indiquée.</div>
          <button type="button" @click.prevent="goHome" style="margin-top:22px;font-size:15px;font-weight:600;color:#1D4ED8;background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.25);padding:12px 22px;border-radius:999px;cursor:pointer">Retour à l'accueil</button>
        </div>
      </template>
      <template v-if="notContactSent">
      <form @submit.prevent="sendContact" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:#334155">Prénom<input type="text" required placeholder="Camille" style="font-size:15px;padding:12px 14px;border:1px solid #DCE3EF;border-radius:11px;font-family:inherit;color:#0F1B33;outline:none"/></label>
          <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:#334155">Nom<input type="text" required placeholder="Durand" style="font-size:15px;padding:12px 14px;border:1px solid #DCE3EF;border-radius:11px;font-family:inherit;color:#0F1B33;outline:none"/></label>
        </div>
        <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:#334155">Email<input type="email" required placeholder="camille@email.com" style="font-size:15px;padding:12px 14px;border:1px solid #DCE3EF;border-radius:11px;font-family:inherit;color:#0F1B33;outline:none"/></label>
        <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:#334155">Sujet<select required style="font-size:15px;padding:12px 14px;border:1px solid #DCE3EF;border-radius:11px;font-family:inherit;color:#0F1B33;outline:none;background:#fff"><option value="">Choisir…</option><option>Question sur les offres</option><option>Aide technique</option><option>Partenariat</option><option>Autre</option></select></label>
        <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:#334155">Message<textarea required rows="5" placeholder="Votre message…" style="font-size:15px;padding:12px 14px;border:1px solid #DCE3EF;border-radius:11px;font-family:inherit;color:#0F1B33;outline:none;resize:vertical"></textarea></label>
        <button type="submit" style="margin-top:4px;font-size:15px;font-weight:600;color:#fff;padding:14px 24px;border-radius:999px;background:linear-gradient(135deg,#3B82F6,#1D4ED8);border:0;cursor:pointer;box-shadow:0 12px 26px rgba(37,99,235,.3)">Envoyer le message</button>
      </form>
      </template>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="background:#fff;border:1px solid #E6EBF3;border-radius:18px;padding:22px 24px"><div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563EB;margin-bottom:8px">Email</div><div style="font-size:16px;font-weight:600;color:#0F1B33">contact@verebona.com</div><div style="font-size:14px;color:#64748B;margin-top:4px">Réponse sous 24&nbsp;h ouvrées</div></div>
      <div style="background:#fff;border:1px solid #E6EBF3;border-radius:18px;padding:22px 24px"><div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563EB;margin-bottom:8px">Support</div><div style="font-size:15px;color:#475569;line-height:1.6">Consultez d'abord notre <a href="#" @click.prevent="goAide" style="color:#1D4ED8;font-weight:600">Centre d'aide</a> : la plupart des réponses s'y trouvent déjà.</div></div>
      <div style="background:linear-gradient(135deg,#0F172A,#1E293B);border-radius:18px;padding:24px;color:#fff"><div style="font-size:16px;font-weight:700;font-family:'Bricolage Grotesque',sans-serif">Verebona</div><div style="font-size:14px;color:#9BA6BC;margin-top:6px;line-height:1.6">L'inventaire administré de votre patrimoine, centralisé et prêt le moment venu.</div></div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { useContact } from '../composables/useContact'
import { useNav } from '../composables/useNav'
const { contactSent, notContactSent, sendContact, crumbLabel } = useContact()
const { goHome, goAide } = useNav()
</script>

<template>
<section id="how" style="background:#F4F7FC;color:#0F1B33;padding:88px 24px;position:relative;overflow:hidden">
  <div style="position:absolute;top:-12%;right:-6%;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.10),transparent 62%);pointer-events:none"></div>
  <div style="max-width:1200px;margin:0 auto;position:relative">
    <div class="r-2b" style="display:grid;grid-template-columns:1.05fr .95fr;gap:52px;align-items:center">
      <div class="vb-reveal">
        <div style="font-size:13.5px;letter-spacing:.15em;text-transform:uppercase;font-weight:800;color:#2563EB;margin-bottom:12px">Comment ça marche</div>
        <h2 style="font-size:42px;font-weight:600;letter-spacing:-.02em;color:#0F1B33;line-height:1.14;margin-bottom:14px">Vous déposez. Verebona organise.</h2>
        <p style="font-size:15.5px;line-height:1.65;color:#5B6577;margin-bottom:30px">Ajoutez vos documents. Verebona les comprend, les relie à vos biens, complète vos informations et prépare vos prochaines échéances.</p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button v-for="(s, i) in steps" :key="i" type="button" :aria-pressed="demo === i" style="position:relative;display:flex;gap:18px;text-align:left;width:100%;padding:14px 16px;border-radius:14px;cursor:pointer;border:1px solid transparent;background:transparent;font-family:'Instrument Sans',sans-serif" @click.prevent="select(i)">
            <template v-if="demo === i">
              <span style="position:absolute;inset:0;border-radius:14px;background:#fff;border:1px solid rgba(37,99,235,.28);box-shadow:0 12px 28px rgba(15,27,51,.08);pointer-events:none"></span>
            </template>
            <span style="font-family:'Bricolage Grotesque',sans-serif;font-size:34px;font-weight:700;line-height:1;color:rgba(37,99,235,.3);flex-shrink:0;position:relative">{{ s.num }}</span>
            <span style="display:block;position:relative"><span style="display:block;font-size:18px;font-weight:600;color:#0F1B33;margin-bottom:5px">{{ s.title }}</span><span style="display:block;font-size:14px;line-height:1.6;color:#5B6577">{{ s.desc }}</span></span>
          </button>
        </div>
      </div>

      <div class="vb-reveal" style="transition-delay:.12s;position:relative">
        <div style="position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:460px;height:460px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.14),transparent 62%);pointer-events:none"></div>
        <div aria-live="polite" style="position:relative;border-radius:20px;background:rgba(10,17,35,.9);border:1px solid rgba(148,163,184,.2);box-shadow:0 30px 60px rgba(15,27,51,.18);padding:18px;min-height:250px;display:flex;flex-direction:column;justify-content:center">
          <template v-if="demo === 0">
            <div class="vb-demoanim" style="display:flex;flex-direction:column;align-items:center;gap:14px;border:1.5px dashed rgba(96,165,250,.45);border-radius:14px;background:rgba(37,99,235,.05);padding:30px 18px;animation:vb-pop .45s ease both">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7EB0FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 8l5-5 5 5"/><path d="M12 3v12"/></svg>
              <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;background:rgba(15,23,42,.9);border:1px solid rgba(148,163,184,.25);box-shadow:0 14px 30px rgba(4,10,26,.4)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2.5H7A2 2 0 0 0 5 4.5v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5Z"/><path d="M14 2.5v5h5"/></svg>
                <span style="font-size:13px;font-weight:600;color:#E2E8F0">facture-chaudiere-2026.pdf</span>
                <span style="font-size:11px;color:#64748B">182 Ko</span>
              </div>
              <div style="font-size:13px;color:#8FA0BB;text-align:center">Photo, PDF ou email — déposé tel quel.</div>
            </div>
          </template>
          <template v-if="demo === 1">
            <div style="display:flex;flex-direction:column;gap:9px">
              <div class="vb-demoanim" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(15,23,42,.9);border:1px solid rgba(148,163,184,.25);animation:vb-pop .4s ease both">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2.5H7A2 2 0 0 0 5 4.5v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5Z"/><path d="M14 2.5v5h5"/></svg>
                <span style="font-size:12.5px;font-weight:600;color:#E2E8F0">facture-chaudiere-2026.pdf</span>
                <span class="vb-demoanim" style="margin-left:auto;font-size:11px;font-weight:700;color:#93C5FD;animation:vb-pulse 1.2s ease-in-out infinite">Analyse…</span>
              </div>
              <div class="vb-demoanim" style="display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:11px;background:rgba(37,99,235,.09);border:1px solid rgba(59,130,246,.3);animation:vb-pop .4s .2s ease both">
                <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7EB0FF;width:100px;flex-shrink:0">Bien identifié</span>
                <span style="font-size:13px;font-weight:600;color:#EAF0FB">Appartement Lyon</span>
              </div>
              <div class="vb-demoanim" style="display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:11px;background:rgba(37,99,235,.09);border:1px solid rgba(59,130,246,.3);animation:vb-pop .4s .4s ease both">
                <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7EB0FF;width:100px;flex-shrink:0">Catégorie</span>
                <span style="font-size:13px;font-weight:600;color:#EAF0FB">Facture · Entretien chaudière</span>
              </div>
              <div class="vb-demoanim" style="display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:11px;background:rgba(37,99,235,.09);border:1px solid rgba(59,130,246,.3);animation:vb-pop .4s .6s ease both">
                <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7EB0FF;width:100px;flex-shrink:0">Infos utiles</span>
                <span style="font-size:13px;font-weight:600;color:#EAF0FB">145,00 € · 12/03/2026</span>
              </div>
            </div>
          </template>
          <template v-if="demo === 2">
            <div style="display:flex;flex-direction:column;gap:10px">
              <div class="vb-demoanim" style="border-radius:13px;background:rgba(15,23,42,.9);border:1px solid rgba(34,197,94,.35);padding:13px 14px;animation:vb-pop .4s ease both">
                <div style="display:flex;align-items:center;gap:11px;margin-bottom:10px">
                  <img src="/assets/appartement-lyon.webp" alt="" style="width:38px;height:38px;border-radius:9px;object-fit:cover;flex-shrink:0">
                  <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#EAF0FB">Appartement Lyon</div><div style="font-size:10.5px;color:#8FA0BB">Fiche complétée automatiquement</div></div>
                  <span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:6px;background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.35);color:#4ADE80">✓ Classé</span>
                </div>
                <div style="display:flex;align-items:center;gap:9px;padding:8px 11px;border-radius:9px;background:rgba(7,14,32,.6);border:1px solid rgba(148,163,184,.14)">
                  <span style="color:#4ADE80;font-weight:700;font-size:12px">✓</span>
                  <span style="font-size:12px;color:#C3CDDE">Facture · Entretien chaudière · 145,00 €</span>
                </div>
              </div>
              <div class="vb-demoanim" style="display:flex;align-items:center;gap:11px;padding:12px 14px;border-radius:13px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.3);animation:vb-pop .4s .3s ease both">
                <div style="width:32px;height:32px;border-radius:9px;background:rgba(245,158,11,.14);color:#FBBF24;display:flex;align-items:center;justify-content:center;flex-shrink:0">◷</div>
                <div style="flex:1"><div style="font-size:12.5px;font-weight:600;color:#EAF0FB">Prochaine échéance détectée</div><div style="font-size:11px;color:#B7C4DC">Entretien annuel chaudière · mars 2027 · rappel programmé</div></div>
              </div>
            </div>
          </template>
        </div>
        <template v-if="showMascot">
        <div style="display:flex;align-items:flex-end;gap:12px;margin-top:16px;position:relative">
          <img src="/assets/mascot/document-analysis-pdf.webp" alt="Mascotte Verebona" style="width:92px;height:auto;flex-shrink:0;filter:drop-shadow(0 16px 26px rgba(15,27,51,.22))">
          <div style="flex:1;padding:12px 16px;border-radius:16px 16px 16px 4px;background:#fff;border:1px solid #DCE5F2;box-shadow:0 8px 22px rgba(15,27,51,.07);font-size:13.5px;line-height:1.5;color:#33415A;margin-bottom:8px">{{ mascotSays }}</div>
        </div>
        </template>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLanding } from '../composables/useLanding'

const { showMascot } = useLanding()

// Démo interactive en 3 états : dépôt → analyse → fiche + échéance.
// Auto-défilement toutes les 3,6 s, stoppé au premier clic,
// désactivé si l'utilisateur préfère réduire les animations.
const demo = ref(0)
let iv: number | null = null
const select = (i: number) => { if (iv) { clearInterval(iv); iv = null } demo.value = i }
onMounted(() => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) iv = window.setInterval(() => { demo.value = (demo.value + 1) % 3 }, 3600)
})
onUnmounted(() => { if (iv) clearInterval(iv) })

const mascotSays = computed(() => [
  "« Je réceptionne votre document, je regarde ce qu'il contient. »",
  "« J'ai reconnu l'Appartement Lyon, la catégorie et le montant. »",
  "« J'ai classé cette facture et repéré la prochaine échéance. »",
][demo.value])

const steps = [
  { num: '01', title: 'Vous déposez', desc: 'Ajoutez vos documents comme ils viennent : factures, contrats, diagnostics, garanties, photos.' },
  { num: '02', title: 'Verebona organise', desc: 'Verebona analyse vos documents, les classe, les rattache aux bons biens et extrait les informations utiles.' },
  { num: '03', title: "Vous gardez l'essentiel sous la main", desc: 'Vos échéances, dossiers, documents et informations importantes sont prêts quand vous en avez besoin.' },
]
</script>

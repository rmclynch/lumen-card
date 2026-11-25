/*
 * Lumen card — version one
 * A living-sky whole-house dashboard for Home Assistant.
 *
 * Reads floors and areas from Home Assistant, stacks the floors,
 * glows rooms that have something on, tints rooms that are heating,
 * shows each room's temperature, and gives full radiator control.
 *
 * Install: copy to <config>/www/lumen-card.js, add /local/lumen-card.js
 * as a JavaScript module resource, then use `type: custom:lumen-card`
 * in a panel view.
 */

const LUMEN_VERSION = '0.6.2';

const LUMEN_STYLE = `
:host{display:block;height:100%;--lumen-font:Inter,'Segoe UI',Roboto,system-ui,sans-serif;--lumen-head:'Space Grotesk',Inter,'Segoe UI',system-ui,sans-serif}
*{box-sizing:border-box}
.root{position:relative;width:100%;height:calc(100vh - var(--lumen-top, var(--header-height, 56px)));height:calc(100dvh - var(--lumen-top, var(--header-height, 56px)));min-height:420px;overflow:hidden;font-family:var(--lumen-font);color:#f4f1ff;transition:background 2s ease}
.sun{position:absolute;inset:0;pointer-events:none;transition:background 2s ease}
.ui{position:absolute;inset:0}
.fxs{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.fx{position:absolute;inset:0;pointer-events:none;overflow:hidden;transition:background 2s ease}
.soft .fxp{opacity:0.5}
.drop{position:absolute;top:-40px;width:2px;height:26px;border-radius:2px;background:linear-gradient(to bottom,rgba(210,225,255,0),rgba(210,225,255,0.75));animation:lumenFall 0.7s linear infinite}
@keyframes lumenFall{from{transform:translate(0,0) rotate(12deg)}to{transform:translate(-18vw,110vh) rotate(12deg)}}
.flake{position:absolute;top:-20px;border-radius:50%;background:#ffffff;animation:lumenSnow 8s linear infinite}
@keyframes lumenSnow{0%{transform:translate(0,0)}50%{transform:translate(-30px,55vh)}100%{transform:translate(30px,110vh)}}
.cloud{position:absolute;left:0;width:34vw;height:18vh;border-radius:999px;background:radial-gradient(ellipse at center,rgba(235,238,245,0.5),rgba(235,238,245,0) 70%);animation:lumenDrift 50s linear infinite}
@keyframes lumenDrift{from{transform:translateX(-40vw)}to{transform:translateX(130vw)}}
.gust{position:absolute;height:48px;overflow:visible;animation:lumenGustMove 4s linear infinite}
.gust path{fill:none;stroke:rgba(255,255,255,0.6);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:32 100;animation:lumenGustDash 4s ease-in-out infinite;animation-duration:inherit;animation-delay:inherit}
@keyframes lumenGustMove{from{transform:translateX(-40px)}to{transform:translateX(120px)}}
@keyframes lumenGustDash{0%{stroke-dashoffset:132;opacity:0}15%{opacity:1}80%{opacity:1}100%{stroke-dashoffset:-34;opacity:0}}
.shimmer{animation:lumenShimmer 4s ease-in-out infinite}
.soft .shimmer{animation-name:lumenShimmerSoft;animation-duration:7s}
@keyframes lumenShimmer{0%,100%{opacity:0.25}50%{opacity:0.9}}
@keyframes lumenShimmerSoft{0%,100%{opacity:0.2}50%{opacity:0.5}}
.calm .fxs *,.calm .badge svg{animation:none !important}
.calm .fxp{display:none}
.glass{-webkit-backdrop-filter:blur(14px) saturate(1.15);backdrop-filter:blur(14px) saturate(1.15)}
.topr{display:flex;align-items:center;gap:10px}
.setbtn{width:40px;height:40px;border-radius:999px;border:0;background:transparent;color:rgba(244,241,255,0.55);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.setbtn svg{width:20px;height:20px}
.setbtn:hover,.setbtn:focus-visible{color:#f4f1ff;background:rgba(255,255,255,0.1)}
.m-small .setbtn{width:44px;height:44px}
.setrow{display:flex;flex-direction:column;gap:8px}
.setrow .lbl{font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#cfcae6}
.setrow .shint{font-size:13px;color:#a9a3c6}
.setrow select{min-height:44px;border-radius:14px;border:1px solid rgba(255,255,255,0.3);background:rgba(20,22,52,0.9);color:#f4f1ff;font-family:var(--lumen-font);font-size:15px;padding:0 12px;max-width:340px}
.setfoot{font-size:12px;color:#a9a3c6;text-align:center}
.help{gap:16px}
.help h3{margin:0 0 4px;font-family:var(--lumen-head);font-size:17px;font-weight:600;color:#ffd29a}
.help p,.help li{margin:0;font-size:15px;line-height:1.5;color:#e9e5fb}
.help ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px}
.help .hsec{display:flex;flex-direction:column;gap:6px;padding:14px 16px;border-radius:18px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1)}
.help .hnow{background:rgba(255,210,154,0.12);border-color:rgba(255,210,154,0.45)}
.help table{border-collapse:collapse;width:100%;font-size:14px}
.help th,.help td{text-align:left;padding:7px 8px;border-bottom:1px solid rgba(255,255,255,0.1)}
.help th{font-weight:600;color:#cfcae6;font-size:13px}
.help td.y{color:#9be7b0;font-weight:600}
.help td.n{color:#a9a3c6}
.help th.cur,.help td.cur{background:rgba(255,210,154,0.1)}
.top{position:absolute;left:24px;right:24px;top:20px;display:flex;justify-content:space-between;align-items:center;gap:12px;z-index:5}
.brand{display:flex;align-items:baseline;gap:14px;padding:10px 22px;border-radius:999px;background:rgba(12,14,38,0.68)}
.brand b{font-family:var(--lumen-head);font-size:24px;font-weight:700;letter-spacing:.5px}
.brand span{font-size:14px;color:#d6d2ea}
.wx{display:flex;align-items:center;gap:10px;padding:9px 18px;border-radius:999px;background:rgba(12,14,38,0.68);font-size:14px;font-weight:600}
.wx .t{font-family:var(--lumen-head);font-size:18px;color:#ffd29a}
.stagewrap{position:absolute;left:112px;right:104px;top:80px;bottom:16px;display:flex;flex-direction:column;gap:12px;z-index:2}
.card{position:relative;flex:1 1 auto;min-height:0;border-radius:28px;background:rgba(14,16,40,0.72);border:1px solid rgba(255,255,255,0.18);-webkit-backdrop-filter:blur(14px) saturate(1.15);backdrop-filter:blur(14px) saturate(1.15);padding:16px 22px 12px;display:flex;flex-direction:column}
.cardhead{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.cardhead h1{margin:0;font-family:var(--lumen-head);font-size:26px;font-weight:600}
.cardhead span{font-size:14px;color:#cfcae6}
.stage{position:relative;flex:1 1 auto;min-height:0;overflow:hidden}
.hint{align-self:center;margin:6px 0 0;padding:5px 14px;border-radius:999px;background:rgba(255,255,255,0.06);font-size:12px;color:#cfcae6}
.plate{position:absolute}
.plabel{position:absolute;z-index:7;transform:translate(-50%,-50%);min-width:30px;height:30px;padding:0 8px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(12,14,38,0.82);border:1px solid rgba(255,255,255,0.35);font-family:var(--lumen-head);font-size:15px;font-weight:700;pointer-events:none}
.floor{position:absolute;left:50%;top:50%;border-radius:18px;background:rgba(20,22,52,0.55);border:1px solid rgba(255,255,255,0.35);box-shadow:0 18px 40px rgba(0,0,0,0.35)}
.floor.below{background:rgba(6,8,22,0.75);border:2px dashed rgba(255,255,255,0.45)}
.rooms{position:absolute;inset:10px}
.room{position:absolute;border-radius:10px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.06);color:#f4f1ff;font-family:var(--lumen-font);font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px;text-align:center;overflow:hidden;transition:background .3s,border-color .3s,box-shadow .3s}
.room:hover{background:rgba(255,255,255,0.16)}
.room:focus-visible{outline:3px solid #ffffff;outline-offset:2px}
.room.on{background:rgba(255,196,120,0.38);border-color:#ffc47a;box-shadow:0 0 34px rgba(255,180,100,0.75),inset 0 0 18px rgba(255,210,140,0.35)}
.room.alert{outline:3px solid #ff5a5a;outline-offset:2px;animation:lumenPulse 1.4s ease-in-out infinite}
.room > span{position:relative;z-index:1}
.room .rn{font-size:var(--rf,13px);line-height:1.2}
.tiny .room .rn{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.rt{padding:1px 7px;border-radius:999px;background:rgba(8,10,28,0.6);color:#ffd29a;font-family:var(--lumen-head);font-size:max(11px,calc(var(--rf,13px) - 1px));font-weight:600;line-height:1.3}
.tag{max-width:none;position:absolute;z-index:6;transform:translate(-50%,-50%) rotateX(var(--rx,60deg)) rotateZ(-30deg);display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none;text-align:center;max-width:150px}
.tag .tn{white-space:normal;text-align:center;overflow-wrap:normal;word-break:keep-all;padding:0 4px;font-size:var(--tf,24px);font-weight:500;letter-spacing:.2px;line-height:1.15;color:#f4f1ff;text-shadow:0 1px 3px rgba(0,0,0,0.85),0 0 10px rgba(0,0,0,0.55)}
.tag .tt{padding:0 4px;font-family:var(--lumen-head);font-size:var(--tf,24px);font-weight:500;color:#ffd29a;line-height:1.25;text-shadow:0 1px 3px rgba(0,0,0,0.85),0 0 10px rgba(0,0,0,0.55)}
.heat,.cool{position:absolute !important;left:0;right:0;bottom:0;height:45%;pointer-events:none;z-index:0 !important}
.heat{background:linear-gradient(to top,rgba(255,105,45,0.7),rgba(255,105,45,0))}
.cool{background:linear-gradient(to top,rgba(80,175,255,0.7),rgba(80,175,255,0))}
.badges{position:absolute !important;top:4px;right:4px;display:flex;gap:2px;z-index:2 !important}
.badge{width:18px;height:18px;border-radius:999px;background:rgba(8,10,28,0.72);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#f4f1ff}
.badge svg{width:11px;height:11px}
.planwrap{position:relative;flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}
.plan{position:relative;height:100%;max-width:100%;aspect-ratio:400/290}
.plan.editing{background-image:linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px);background-size:5% 5%;border-radius:12px;outline:1px dashed rgba(255,255,255,0.25);touch-action:none}
.plan .room.edit{cursor:grab;border-style:dashed;border-color:rgba(255,255,255,0.55);box-shadow:none;animation:none;outline:none;user-select:none;-webkit-user-select:none}
.plan .room.edit.clash{border-color:#ff8a8a;background:rgba(255,90,90,0.14)}
.plan .room.edit.dragging{cursor:grabbing;z-index:20;background:rgba(255,255,255,0.18);border-color:#ffffff}
.handle{position:absolute !important;right:-2px;bottom:-2px;width:26px;height:26px;border-radius:8px 0 14px 0;background:#f4f1ff;cursor:nwse-resize;z-index:3 !important;display:flex;align-items:center;justify-content:center}
.handle::after{content:'';width:10px;height:10px;border-right:2px solid #1b1d3f;border-bottom:2px solid #1b1d3f}
.headbtns{display:flex;gap:8px;align-items:center}
.pill.small{min-height:38px;padding:0 14px;font-size:13px}
.savemsg{font-size:13px;color:#ffd29a}
.plan .room{border-radius:16px;align-items:flex-start;justify-content:space-between;text-align:left;padding:14px 16px}
.plan .room .rn{font-size:17px}
.plan .room .sum{font-size:13px;font-weight:500;color:#e3def5}
.plan .badges{top:10px;right:10px;gap:4px}
.plan .badge{width:24px;height:24px}
.plan .badge svg{width:14px;height:14px}
nav.lift{position:absolute;right:28px;top:96px;display:flex;flex-direction:column;gap:10px;padding:8px;border-radius:999px;background:rgba(12,14,38,0.68);z-index:5}
.lbtn{width:52px;height:52px;border-radius:999px;border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.06);color:#e9e6f7;font-family:var(--lumen-head);font-size:18px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.lbtn:hover{background:rgba(255,255,255,0.16)}
.lbtn.active{background:#f4f1ff;color:#1b1d3f;border-color:#f4f1ff}
.lbtn svg{width:22px;height:22px}
.shade{position:absolute;inset:0;z-index:30;background:rgba(4,6,18,0.62);display:flex;align-items:center;justify-content:center;padding:24px}
.panel{width:min(880px,100%);max-height:100%;overflow-y:auto;border-radius:28px;background:#16183c;border:1px solid rgba(255,255,255,0.2);box-shadow:0 30px 80px rgba(0,0,0,0.55);padding:24px 28px 28px;display:flex;flex-direction:column;gap:18px}
.panel.opening{animation:lumenZoom .36s cubic-bezier(.2,.8,.2,1)}
.shade.opening{animation:lumenFade .25s ease}
@keyframes lumenFade{from{opacity:0}to{opacity:1}}
.phead{display:flex;align-items:center;gap:14px}
.phead h2{margin:0;font-family:var(--lumen-head);font-size:28px;font-weight:600}
.phead .sub{font-size:14px;color:#cfcae6}
.phead .ptemp{margin-left:auto;font-family:var(--lumen-head);font-size:28px;color:#ffd29a}
.pill{min-height:44px;padding:0 18px;border-radius:999px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.08);color:#f4f1ff;font-family:var(--lumen-font);font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.pill:hover{background:rgba(255,255,255,0.16)}
.pill.on{background:#f4f1ff;color:#1b1d3f;border-color:#f4f1ff}
.pill.warm{background:#ffc47a;color:#2a1a08;border-color:#ffc47a}
.devs{display:flex;flex-direction:column;gap:8px}
.dev{display:flex;align-items:center;gap:12px;padding:8px 10px 8px 16px;border-radius:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1)}
.dopen{flex:1 1 auto;min-width:0;min-height:44px;background:none;border:0;padding:0;color:#f4f1ff;text-align:left;cursor:default;display:flex;flex-direction:column;justify-content:center;gap:2px;font-family:var(--lumen-font)}
.dopen.go{cursor:pointer}
.dopen .nm{font-size:16px;font-weight:600}
.dopen .sm{font-size:13px;color:#cfcae6}
.empty{margin:8px 0;font-size:15px;color:#cfcae6}
.climate{display:grid;grid-template-columns:260px minmax(0,1fr);gap:28px;align-items:center}
.dialbox{display:flex;align-items:center;justify-content:center;border-radius:24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);height:280px}
.ctl{display:flex;flex-direction:column;gap:10px}
.ctlbl{font-size:12px;font-weight:600;color:#cfcae6;text-transform:uppercase;letter-spacing:1px}
.step{width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.08);color:#f4f1ff;font-size:28px;font-weight:600;line-height:1;cursor:pointer}
.step:hover{background:rgba(255,255,255,0.16)}
.opts{display:flex;gap:8px;flex-wrap:wrap}
.note{font-size:13px;color:#cfcae6}
nav.rail{position:absolute;left:24px;top:80px;bottom:16px;width:72px;display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:28px;background:rgba(12,14,38,0.68);z-index:5;overflow-y:auto;scrollbar-width:none}
nav.rail::-webkit-scrollbar{display:none}
nav.rail *{animation:none !important}
.kbtn{flex:none;width:56px;min-height:56px;border-radius:18px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.05);color:#f4f1ff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 0;font-family:var(--lumen-font)}
.kbtn:hover{background:rgba(255,255,255,0.14)}
.kbtn.active{background:rgba(255,255,255,0.22);border:2px solid #f4f1ff}
.klbl{font-size:10px;font-weight:600;color:#e9e6f7}
.mroom{position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:24px;border-radius:7px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.06);overflow:hidden}
.mroom.lit{background:rgba(255,196,120,0.38);border-color:#ffc47a;box-shadow:0 0 12px rgba(255,180,100,0.8);overflow:visible}
.mroom .heat,.mroom .cool{height:60%}
.mroom.alert{overflow:visible;color:#ff8a8a;outline:2px solid #ff5a5a;outline-offset:2px;animation:lumenPulse 1.4s ease-in-out infinite}
.mroom svg{width:13px;height:13px}
.kbtn .badge{width:26px;height:26px}
.kbtn .badge svg{width:15px;height:15px}
.raildiv{flex:none;height:1px;background:rgba(255,255,255,0.25);margin:2px 6px}
.tablewrap{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:6px}
.trow{display:grid;gap:16px;align-items:start;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,0.05)}
.thead{position:sticky;top:0;z-index:3;background:#15173a;box-shadow:0 6px 14px rgba(0,0,0,0.35)}
.thead span{font-size:12px;font-weight:600;color:#cfcae6;text-transform:uppercase;letter-spacing:1px}
.tfloor{margin:10px 14px 0;font-family:var(--lumen-head);font-size:15px;font-weight:600;color:#ffd29a}
.rname{background:none;border:0;padding:0;text-align:left;color:#f4f1ff;font-family:var(--lumen-font);font-size:15px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-height:44px;justify-content:center}
.rname span{font-weight:500;font-size:13px;color:#cfcae6}
.cell{display:flex;flex-wrap:wrap;gap:8px;min-width:0}
.chip{box-sizing:border-box;min-height:44px;max-width:100%;padding:6px 14px;border-radius:14px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.06);color:#e9e6f7;font-family:var(--lumen-font);font-size:14px;font-weight:600;line-height:1.25;cursor:pointer;display:inline-flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left}
.chip.on{background:#ffc47a;color:#2a1a08;border-color:#ffc47a}
.chip.static{cursor:default}
.chip .st{font-size:12px;font-weight:500}
.colhead{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0}
.lightgrid{display:grid;grid-template-columns:240px minmax(0,1fr);gap:28px;align-items:center}
.glowbox{display:flex;align-items:center;justify-content:center;border-radius:24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);height:260px}
.glowball{width:200px;height:200px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background .3s}
.slider{-webkit-appearance:none;appearance:none;width:100%;height:14px;border-radius:999px;margin:8px 0;cursor:pointer}
.slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:50%;background:#ffffff;border:3px solid #16183c;box-shadow:0 0 0 2px #ffffff}
.slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#ffffff;border:3px solid #16183c;box-shadow:0 0 0 2px #ffffff}
.ctlrow{display:flex;justify-content:space-between;align-items:baseline}
.ctlval{font-size:15px;color:#f4f1ff;text-transform:none;letter-spacing:0}
.sw{width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);padding:0;cursor:pointer}
.sw.on{border:3px solid #ffffff;box-shadow:0 0 0 4px rgba(255,255,255,0.22)}
/* rail counts */
.kbtn{position:relative}
.kcount{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#f4f1ff;color:#1b1d3f;font-family:var(--lumen-head);font-size:12px;font-weight:700;line-height:22px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.45)}
nav.rail{padding-top:12px}
/* favourite star */
.pill.star svg{width:18px;height:18px}
.pill.star.on{background:#ffd29a;color:#2a1a08;border-color:#ffd29a}
.pill.star.on svg{fill:#2a1a08}
.phead{flex-wrap:wrap}
.phead .right{margin-left:auto;display:flex;align-items:center;gap:12px}
.phead .right .ptemp{margin-left:0}
/* camera */
.camwrap{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:22px;align-items:start}
.camslot{position:relative;width:100%;aspect-ratio:16/9;border-radius:20px;overflow:hidden;background:#05060f;border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center}
.camimg{width:100%;height:100%;object-fit:contain;display:block;font-size:0;color:transparent}
.camnote{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(5,6,15,0.82);font-size:15px;color:#e3def5;text-align:center;padding:16px;z-index:2}
.camnote svg{width:34px;height:34px}
.dpad{display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(3,60px);gap:6px;justify-content:center}
.dpad button{border-radius:16px}
.dpad .mid{border-radius:50%;background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.2)}
.ibtn{display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.08);color:#f4f1ff;cursor:pointer;padding:0}
.ibtn:hover{background:rgba(255,255,255,0.18)}
.ibtn:active{background:#f4f1ff;color:#1b1d3f}
.ibtn svg{width:26px;height:26px}
/* ---------- phone ---------- */
.root.m-phone{min-height:300px}
.m-phone .top{left:12px;right:12px;top:12px}
.m-phone .brand{padding:8px 16px;gap:10px}
.m-phone .brand b{font-size:19px}
.m-phone .brand span{font-size:12px}
.m-phone .wx{padding:7px 14px;font-size:13px}
.m-phone .wx .t{font-size:16px}
.m-phone nav.rail{left:12px;right:12px;top:66px;bottom:auto;width:auto;flex-direction:row;gap:8px;padding:12px 8px 8px;border-radius:24px;overflow-x:auto;overflow-y:visible}
.m-phone .kbtn{width:auto;min-height:44px;flex-direction:row;gap:8px;padding:0 14px 0 10px;border-radius:999px}
.m-phone .kbtn .klbl{font-size:13px}
.m-phone .kbtn .mroom{width:26px;height:18px}
.m-phone .kbtn .badge{width:22px;height:22px}
.m-phone .kcount{position:static;min-width:20px;height:20px;line-height:20px;font-size:11px;box-shadow:none}
.m-phone .raildiv{width:1px;height:auto;margin:6px 2px}
.m-phone .stagewrap{left:12px;right:12px;top:136px;bottom:84px}
.m-phone .stagewrap.norail{top:66px}
.m-phone .card{border-radius:24px;padding:14px 14px 10px}
.m-phone .cardhead{flex-wrap:wrap;gap:6px}
.m-phone .cardhead h1{font-size:21px}
.m-phone .cardhead span{font-size:13px}
.m-phone nav.lift{left:12px;right:12px;top:auto;bottom:14px;flex-direction:row;justify-content:center;gap:8px;padding:8px;border-radius:999px}
.m-phone .lbtn{width:50px;height:50px}
.flist{flex:1 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:14px;padding-bottom:6px}
.fsec{display:flex;flex-direction:column;gap:8px}
.fhead{display:flex;align-items:center;gap:10px;min-height:44px;background:none;border:0;padding:0;color:#f4f1ff;font-family:var(--lumen-head);font-size:17px;font-weight:600;cursor:pointer;text-align:left}
.fbadge{width:30px;height:30px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(12,14,38,0.82);border:1px solid rgba(255,255,255,0.35);font-size:14px;font-weight:700;flex:none}
.fsub{margin-left:auto;font-family:var(--lumen-font);font-size:13px;font-weight:500;color:#cfcae6}
.m-phone .plan{width:100%;height:auto;max-width:none}
.m-phone .planwrap{align-items:flex-start;overflow-y:auto}
.m-phone .plan .room{padding:6px 8px;border-radius:12px;justify-content:space-between}
.m-phone .plan .room{container-type:inline-size}
.m-phone .plan .room .rn{font-size:13px;font-size:min(13px,calc((100cqw - 4px) / (var(--len,8) * 0.6)));line-height:1.15;overflow:hidden;max-width:100%}
.m-phone .plan .room .sum{font-size:11px}
.m-phone .plan .badges{top:5px;right:5px}
.m-phone .plan .badge{width:18px;height:18px}
.m-phone .plan .badge svg{width:11px;height:11px}
.m-phone .shade{align-items:flex-end;padding:0}
.m-phone .panel{width:100%;max-height:92%;border-radius:26px 26px 0 0;padding:18px 16px 24px;gap:14px}
.m-phone .phead h2{font-size:22px}
.m-phone .phead .ptemp{font-size:22px}
.m-phone .climate,.m-phone .lightgrid,.m-phone .camwrap{grid-template-columns:minmax(0,1fr);gap:16px}
.m-phone .dialbox{height:220px}
.m-phone .dialbox svg{width:190px;height:190px}
.m-phone .glowbox{height:170px}
.m-phone .glowball{width:140px;height:140px}
.m-phone .trow{display:flex;flex-direction:column;gap:8px}
.m-phone .thead{flex-direction:row;flex-wrap:wrap;gap:12px}
.m-phone .thead > span{display:none}
.m-phone .dev{padding:6px 8px 6px 12px;flex-wrap:wrap}
.m-phone .stage + .hint,.m-phone .card > .hint{display:none}
.m-phone .hint{display:none}
/* phone on its side: rail down the left, floors down the right, like the big layout but tighter */
.m-phone.wide .top{top:8px}
.m-phone.wide nav.rail{left:12px;top:62px;bottom:12px;right:auto;width:64px;flex-direction:column;overflow-x:visible;overflow-y:auto;padding:12px 6px 8px;border-radius:22px}
.m-phone.wide .kbtn{width:52px;min-height:52px;flex-direction:column;gap:2px;padding:4px 0;border-radius:16px}
.m-phone.wide .kbtn .klbl{font-size:10px}
.m-phone.wide .kcount{position:absolute;top:-5px;right:-5px}
.m-phone.wide nav.lift{left:auto;right:12px;top:62px;bottom:12px;flex-direction:column;justify-content:flex-start;border-radius:28px;padding:6px}
.m-phone.wide .lbtn{width:44px;height:44px}
.m-phone.wide .stagewrap{left:88px;right:72px;top:62px;bottom:12px}
.m-phone.wide .stagewrap.norail{left:12px}
/* ---------- small square screens ---------- */
.m-small .smwrap{position:absolute;inset:10px;display:flex;flex-direction:column;gap:10px;z-index:2}
.smtop{display:flex;align-items:center;gap:10px;min-height:56px;padding:6px 8px 6px 6px;border-radius:22px;background:rgba(12,14,38,0.72)}
.smtop h1{margin:0;font-family:var(--lumen-head);font-size:22px;font-weight:600;flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.smtop .smt{font-family:var(--lumen-head);font-size:20px;color:#ffd29a}
.smtop .smsub{font-size:13px;color:#cfcae6;white-space:nowrap}
.smbtn{flex:none;min-width:48px;height:48px;border-radius:16px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.08);color:#f4f1ff;display:flex;align-items:center;justify-content:center;gap:4px;padding:0 10px;font-family:var(--lumen-font);font-size:14px;font-weight:600;cursor:pointer}
.smbtn svg{width:22px;height:22px}
.smbtn.on{background:#ffd29a;color:#2a1a08;border-color:#ffd29a}
.smbtn.on svg{fill:#2a1a08}
.smgrid{flex:1 1 auto;min-height:0;overflow-y:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(96px,auto);gap:10px;align-content:start}
.smgrid.one{grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(72px,auto)}
.tile{position:relative;overflow:hidden;border-radius:22px;border:1px solid rgba(255,255,255,0.25);background:rgba(20,22,52,0.72);color:#f4f1ff;padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;gap:6px;text-align:left;font-family:var(--lumen-font);cursor:pointer;min-width:0}
.tile.static{cursor:default}
.tile.on{background:rgba(255,196,120,0.4);border-color:#ffc47a;box-shadow:0 0 22px rgba(255,180,100,0.55)}
.tile.alert{outline:3px solid #ff5a5a;outline-offset:-3px;animation:lumenPulse 1.4s ease-in-out infinite}
.tile > *{position:relative;z-index:1}
.tile .heat,.tile .cool{height:55%}
.tile .tn{font-size:17px;font-weight:600;line-height:1.2;overflow-wrap:anywhere}
.tile .ts{font-size:13px;font-weight:500;color:#e3def5}
.tile.on .ts{color:#2a1a08}.tile.on .tn{color:#2a1a08}
.tile .tic{width:30px;height:30px;border-radius:999px;background:rgba(8,10,28,0.6);display:flex;align-items:center;justify-content:center;color:#f4f1ff}
.tile .tic svg{width:17px;height:17px}
.more{position:absolute;top:8px;right:8px;width:40px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,0.3);background:rgba(8,10,28,0.55);color:#f4f1ff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;padding:0}
.more svg{width:20px;height:20px}
.tile.big{flex-direction:row;align-items:center;justify-content:flex-start;gap:14px}
.tile.big .fbadge{width:44px;height:44px;font-size:18px}
.tile.big .tn{font-family:var(--lumen-head);font-size:20px}
.tile.big .ts{margin-left:auto}
.m-small .shade{padding:0}
.m-small .panel{width:100%;height:100%;max-height:none;border-radius:0;padding:14px;gap:12px}
.m-small .phead h2{font-size:20px}
.m-small .climate,.m-small .lightgrid{grid-template-columns:170px minmax(0,1fr);gap:14px}
.m-small .camwrap{grid-template-columns:minmax(0,1fr);gap:12px}
.m-small .dialbox{height:180px}
.m-small .dialbox svg{width:164px;height:164px}
.m-small .glowbox{height:160px}
.m-small .glowball{width:120px;height:120px}
.m-small .step{width:48px;height:48px;font-size:24px}
.m-small .climate .ctl span[style*="font-size:34px"]{font-size:26px !important;min-width:80px !important}
.m-small .phead .sub{font-size:12px}
@keyframes lumenPulse{0%,100%{outline-color:rgba(255,90,90,1)}50%{outline-color:rgba(255,90,90,0.15)}}
@keyframes lumenZoom{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes lumenSpin{to{transform:rotate(360deg)}}
.spin{animation:lumenSpin 2.4s linear infinite;transform-origin:50% 50%}
@media (prefers-reduced-motion: reduce){*{animation:none !important;transition:none !important}}
`;

const SKIES = {
  dawn:      { bg: 'linear-gradient(180deg,#3b3a6e 0%,#b9799a 55%,#f6c3a4 100%)', sun: 'radial-gradient(circle at 0% 85%,rgba(255,214,170,.75) 0%,rgba(255,214,170,0) 45%)', name: 'Dawn' },
  morning:   { bg: 'linear-gradient(180deg,#4f86c6 0%,#8fb9e3 60%,#e6eef7 100%)', sun: 'radial-gradient(circle at 20% 10%,rgba(255,250,225,.8) 0%,rgba(255,250,225,0) 40%)', name: 'Morning' },
  midday:    { bg: 'linear-gradient(180deg,#3f8fd8 0%,#8cc4ef 60%,#eaf5fd 100%)', sun: 'radial-gradient(circle at 50% -10%,rgba(255,255,240,.9) 0%,rgba(255,255,240,0) 45%)', name: 'Midday' },
  afternoon: { bg: 'linear-gradient(180deg,#3d7fc4 0%,#9cb9dc 60%,#f3e6d4 100%)', sun: 'radial-gradient(circle at 80% 15%,rgba(255,240,210,.8) 0%,rgba(255,240,210,0) 42%)', name: 'Afternoon' },
  sunset:    { bg: 'linear-gradient(180deg,#24264f 0%,#7a3f6b 45%,#d8645e 75%,#f3a65a 100%)', sun: 'radial-gradient(circle at 100% 88%,rgba(255,190,110,.8) 0%,rgba(255,190,110,0) 45%)', name: 'Sunset' },
  night:     { bg: 'linear-gradient(180deg,#070a1f 0%,#121a3d 60%,#1d2a55 100%)', sun: 'radial-gradient(circle at 82% 14%,rgba(210,220,255,.35) 0%,rgba(210,220,255,0) 30%)', name: 'Night' }
};

const WX_NAMES = {
  'clear-night': 'Clear', cloudy: 'Cloudy', exceptional: 'Unusual', fog: 'Fog', hail: 'Hail',
  lightning: 'Lightning', 'lightning-rainy': 'Thunder', partlycloudy: 'Partly cloudy', pouring: 'Pouring',
  rainy: 'Rain', snowy: 'Snow', 'snowy-rainy': 'Sleet', sunny: 'Sunny', windy: 'Windy', 'windy-variant': 'Windy'
};

const ICON = {
  house: '<path d="M3 11l9-7 9 7"></path><path d="M5 10v10h14V10"></path><path d="M10 20v-6h4v6"></path>',
  media: '<rect x="3" y="5" width="18" height="12" rx="2"></rect><path d="M8 21h8"></path>',
  door: '<path d="M5 21V4h9v17"></path><path d="M14 4l5 2v15l-5-1"></path>',
  plug: '<path d="M9 2v5"></path><path d="M15 2v5"></path><path d="M6 7h12v4a6 6 0 0 1-12 0z"></path>',
  fan: '<circle cx="12" cy="12" r="1.6"></circle><path d="M12 10.4C11 7 12 3.5 15 4s1.5 4.5-3 6.4z"></path><path d="M13.4 12.8c3.4 1 5.8 3.6 4 6s-4.6-.6-4-6z"></path><path d="M10.6 12.8c-2.4 2.6-6 3.4-6.8.6s3.6-3.6 6.8-.6z"></path>',
  alert: '<path d="M12 3l10 18H2z"></path><path d="M12 10v4"></path>',
  close: '<path d="M6 6l12 12"></path><path d="M18 6L6 18"></path>',
  back: '<path d="M15 18l-6-6 6-6"></path>',
  gear: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"></path><path d="M4 21a2 2 0 0 1 2-2h13v2"></path>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"></path>',
  camera: '<path d="M3 8a2 2 0 0 1 2-2h3l1.5-2h5L16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><circle cx="12" cy="13" r="3.5"></circle>',
  up: '<path d="M6 15l6-6 6 6"></path>',
  down: '<path d="M6 9l6 6 6-6"></path>',
  left: '<path d="M15 18l-6-6 6-6"></path>',
  right: '<path d="M9 6l6 6-6 6"></path>',
  plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
  minus: '<path d="M5 12h14"></path>',
  bulb: '<path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"></path><path d="M9 18h6"></path><path d="M10 21h4"></path>',
  heat: '<path d="M12 3c2 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3-1-5 1-8z"></path>'
};

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const svg = (name, extra) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ''}>${ICON[name]}</svg>`;
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const fmtT = (v) => (v == null ? '' : (Math.round(v * 10) / 10).toFixed(1) + '°');

class LumenCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._view = { floor: null, room: null, entity: null };
    this._pending = {};
    this._sig = '';
    this._onClick = this._onClick.bind(this);
    this.shadowRoot.addEventListener('click', this._onClick);
    this.shadowRoot.addEventListener('change', (e) => this._onSetChange(e));
    this._lastTouch = Date.now();
    const touched = () => { this._lastTouch = Date.now(); };
    this.shadowRoot.addEventListener('pointerdown', touched, true);
    this.shadowRoot.addEventListener('keydown', touched, true);
    this.shadowRoot.addEventListener('wheel', touched, { capture: true, passive: true });
    this.shadowRoot.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    this.shadowRoot.addEventListener('pointermove', (e) => this._onPointerMove(e));
    this.shadowRoot.addEventListener('pointerup', () => this._onPointerUp());
    this.shadowRoot.addEventListener('pointercancel', () => this._onPointerUp());
    // sliders: send on release, and don't redraw under a finger while sliding
    this.shadowRoot.addEventListener('pointerdown', (e) => { if (e.target.matches && e.target.matches('input[type=range]')) this._sliding = true; }, true);
    this.shadowRoot.addEventListener('change', (e) => {
      const t = e.target;
      this._sliding = false;
      if (!t.dataset || !t.dataset.act) return;
      const id = t.dataset.id, v = parseFloat(t.value);
      if (t.dataset.act === 'bri') this._hass.callService('light', 'turn_on', { entity_id: id, brightness_pct: v });
      if (t.dataset.act === 'kelvin') this._hass.callService('light', 'turn_on', { entity_id: id, color_temp_kelvin: v });
    });
  }

  static getStubConfig() { return {}; }
  setConfig(config) { this._config = Object.assign({}, config || {}); this._sig = ''; this._render(); }
  getCardSize() { return 12; }
  getGridOptions() { return { columns: 'full', rows: 12 }; }

  set hass(hass) {
    this._hass = hass;
    // new or moved devices change Home Assistant's registries without changing any state,
    // and Home Assistant swaps in a new registry object when that happens
    const regs = [hass.entities, hass.devices, hass.areas, hass.floors];
    const regsChanged = !this._regs || regs.some((r, i) => r !== this._regs[i]);
    this._regs = regs;
    const sig = this._signature();
    if (regsChanged || sig !== this._sig) { this._sig = sig; this._render(); }
  }
  get hass() { return this._hass; }

  connectedCallback() {
    this._tick = setInterval(() => { this._sig = ''; this._render(); }, 60000);
    // like a lift going home: after a few minutes without a touch, go back to this screen's own room
    this._idle = setInterval(() => this._goHomeIfIdle(), 15000);
    // the phone app's header settles a moment after the page opens: measure again once it has
    [400, 1500, 4000].forEach((ms) => setTimeout(() => { this._topPx = null; this._measureTop(); }, ms));
    this._onResize = () => this._render();
    window.addEventListener('resize', this._onResize);
    if (window.ResizeObserver) {
      // watch the stage itself: it can change size without the card's outer box changing
      this._ro = new ResizeObserver(() => {
        const st = this.shadowRoot && this.shadowRoot.querySelector('.stage');
        const key = st ? st.clientWidth + 'x' + st.clientHeight : 'none';
        if (key === this._stageKey && this._mode() === this._modeNow) return;
        cancelAnimationFrame(this._roFrame);
        this._roFrame = requestAnimationFrame(() => this._render());
      });
      this._ro.observe(this);
    }
    if (this._wantsKiosk()) [0, 300, 1000, 2500].forEach((ms) => setTimeout(() => this._applyKiosk(), ms));
  }
  disconnectedCallback() {
    clearInterval(this._tick);
    clearInterval(this._idle);
    this._stopCamera();
    window.removeEventListener('resize', this._onResize);
    if (this._ro) this._ro.disconnect();
  }

  /* ---------- kiosk: hide Home Assistant's sidebar and top bar ---------- */

  _wantsKiosk() {
    try { return !!(this._config && this._config.kiosk) || new URLSearchParams(window.location.search).has('kiosk'); }
    catch (e) { return false; }
  }

  _applyKiosk() {
    try {
      const ha = document.querySelector('home-assistant');
      const main = ha && ha.shadowRoot && ha.shadowRoot.querySelector('home-assistant-main');
      const mr = main && main.shadowRoot;
      if (!mr) return;
      const sidebar = mr.querySelector('ha-sidebar');
      if (sidebar) sidebar.style.display = 'none';
      const drawer = mr.querySelector('ha-drawer');
      if (drawer) {
        drawer.style.setProperty('--mdc-drawer-width', '0px');
        drawer.style.setProperty('--sidebar-width', '0px');
        const ds = drawer.shadowRoot;
        if (ds && !ds.getElementById('lumen-kiosk')) {
          const st = document.createElement('style');
          st.id = 'lumen-kiosk';
          st.textContent = '.sidebar-shell,.mdc-drawer{display:none !important;width:0 !important}.app-content,.mdc-drawer-app-content{padding-left:0 !important;margin-left:0 !important;padding-inline-start:0 !important;margin-inline-start:0 !important}';
          ds.appendChild(st);
        }
      }
      const lov = mr.querySelector('ha-panel-lovelace') || (mr.querySelector('partial-panel-resolver') || { querySelector: () => null }).querySelector('ha-panel-lovelace');
      const root = lov && lov.shadowRoot && lov.shadowRoot.querySelector('hui-root');
      const rr = root && root.shadowRoot;
      if (rr) {
        const header = rr.querySelector('.header') || rr.querySelector('app-header') || rr.querySelector('.toolbar');
        if (header) header.style.display = 'none';
        const view = rr.querySelector('#view');
        if (view) { view.style.paddingTop = '0'; view.style.marginTop = '0'; view.style.minHeight = '100vh'; }
      }
      this.style.setProperty('--lumen-top', '0px');
      this._kioskOn = true;
    } catch (e) { /* Home Assistant changed its layout: leave things as they are */ }
  }

  _measureTop() {
    if (this._kioskOn) return;
    const top = Math.max(0, Math.round(this.getBoundingClientRect().top + (window.scrollY || 0)));
    if (top === this._topPx) return;
    this._topPx = top;
    this.style.setProperty('--lumen-top', top + 'px');
  }

  /* ---------- screen size: full, phone or small ---------- */

  _mode() {
    const forced = this._screen().mode || (this._config && this._config.mode);
    if (['full', 'phone', 'small'].includes(forced)) return forced;
    const r = this.getBoundingClientRect();
    const w = r.width || window.innerWidth;
    const root = this.shadowRoot && this.shadowRoot.querySelector('.root');
    const h = (root && root.clientHeight) || r.height || window.innerHeight;
    const ratio = w / Math.max(1, h);
    if (w <= 620 && h <= 620 && ratio > 0.7 && ratio < 1.45) return 'small';
    if (w < 720 || h < 460) return 'phone';
    return 'full';
  }

  /* ---------- settings kept on this screen only ---------- */

  _screenKey() { return 'lumen-screen:' + (window.location.pathname || ''); }

  _screen() {
    if (this._screenMem) return this._screenMem;
    let v = {};
    try { v = JSON.parse(window.localStorage.getItem(this._screenKey()) || '{}') || {}; } catch (e) { v = {}; }
    this._screenMem = v;
    return v;
  }

  _setScreen(key, val) {
    const v = Object.assign({}, this._screen());
    if (val === '' || val === 'auto' || val == null) delete v[key]; else v[key] = val;
    this._screenMem = v;
    try { window.localStorage.setItem(this._screenKey(), JSON.stringify(v)); } catch (e) { /* kept for this visit */ }
    if (key === 'effects') { const fx = this.shadowRoot.querySelector('.fxs'); if (fx) fx.dataset.key = ''; }
  }

  _returnMins() {
    const sv = this._screen().return_after;
    if (sv != null) return num(sv);
    return this._config && this._config.return_after != null ? num(this._config.return_after) : 5;
  }

  /* ---------- this screen's favourite room ---------- */

  _favKey() { return 'lumen-fav:' + (window.location.pathname || ''); }

  _getFav() {
    let v = null;
    try { v = window.localStorage.getItem(this._favKey()); } catch (e) { v = null; }
    if (v === '') return null;
    return v || (this._config && this._config.room) || null;
  }

  _setFav(id) {
    try { window.localStorage.setItem(this._favKey(), id || ''); } catch (e) { /* private window: keep it for this visit */ }
    this._favMem = id || '';
  }

  _fav() {
    if (this._favMem !== undefined) return this._favMem || null;
    return this._getFav();
  }

  _homeView(floors) {
    const fav = this._modeNow !== 'phone' ? this._fav() : null;
    const has = fav && (floors || this._model() || []).some((f) => f.rooms.some((r) => r.id === fav));
    return { floor: null, room: has ? fav : null, entity: null, kinds: [] };
  }

  _onSetChange(ev) {
    const t = ev.target.closest && ev.target.closest('select[data-key]');
    if (!t) return;
    if (t.dataset.key === 'room') this._setFav(t.value);
    else this._setScreen(t.dataset.key, t.value);
    this._sig = '';
    this._render();
  }

  _goHomeIfIdle() {
    const mins = this._returnMins();
    if (!mins || !this._hass || this._edit || this._drag || this._sliding) return;
    if (Date.now() - this._lastTouch < mins * 60000) return;
    const home = this._homeView();
    const v = this._view;
    const same = !v.help && (v.floor || null) === home.floor && (v.room || null) === home.room && (v.entity || null) === null && !(v.kinds || []).length;
    if (same) return;
    this._view = home;
    this._sig = '';
    this._render();
  }

  /* ---------- reading Home Assistant ---------- */

  _model() {
    const h = this._hass;
    if (!h) return null;
    const floorsReg = Object.values(h.floors || {});
    const areasReg = Object.values(h.areas || {});
    const devices = h.devices || {};
    const entities = h.entities || {};

    // entity -> area (entity's own area wins, else its device's area)
    const byArea = {};
    Object.keys(h.states).forEach((id) => {
      const reg = entities[id];
      if (!reg || reg.hidden || reg.entity_category) return;
      const areaId = reg.area_id || (reg.device_id && devices[reg.device_id] ? devices[reg.device_id].area_id : null);
      if (!areaId) return;
      (byArea[areaId] = byArea[areaId] || []).push(id);
    });

    const order = this._config.floors;
    let floors = floorsReg.slice().sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
    if (Array.isArray(order) && order.length) floors = order.map((id) => floorsReg.find((f) => f.floor_id === id)).filter(Boolean);

    const roomOf = (a) => this._room(a, byArea[a.area_id] || []);
    const out = floors.map((f) => ({
      id: f.floor_id,
      name: f.name,
      level: f.level,
      short: this._short(f),
      below: (f.level ?? 0) < 0,
      rooms: areasReg.filter((a) => a.floor_id === f.floor_id).sort((a, b) => a.name.localeCompare(b.name)).map(roomOf)
    }));
    const loose = areasReg.filter((a) => !a.floor_id || !floors.some((f) => f.floor_id === a.floor_id));
    if (loose.length) out.push({ id: '_other', name: floors.length ? 'Other rooms' : 'Home', level: 99, short: floors.length ? '+' : 'H', below: false, rooms: loose.map(roomOf) });
    return out.filter((f) => f.rooms.length);
  }

  _short(f) {
    const n = (f.name || '').toLowerCase();
    if (/attic|loft/.test(n)) return 'A';
    if (/ground/.test(n)) return 'G';
    if (/basement|cellar/.test(n)) return (f.level ?? -1) <= -2 ? 'B2' : 'B';
    const lvl = f.level;
    if (lvl == null) return (f.name || '?').slice(0, 1).toUpperCase();
    if (lvl < 0) return 'B' + Math.abs(lvl);
    if (lvl === 0) return 'G';
    return String(lvl);
  }

  _room(area, ids) {
    const h = this._hass;
    const st = (id) => h.states[id];
    const d = (id) => id.split('.')[0];
    const kinds = {};
    let temp = null;
    let climateTemp = null;
    const devs = [];
    const MAIN = ['camera', 'alarm_control_panel', 'climate', 'light', 'fan', 'media_player', 'cover', 'lock'];
    const reg = h.entities || {};
    const byDevice = {};
    ids.forEach((id) => { const dv = reg[id] && reg[id].device_id; if (dv) (byDevice[dv] = byDevice[dv] || []).push(id); });
    const hasMain = {};
    Object.keys(byDevice).forEach((dv) => { hasMain[dv] = byDevice[dv].some((id) => MAIN.includes(d(id))); });
    const isCameraDevice = {};
    Object.keys(byDevice).forEach((dv) => { isCameraDevice[dv] = byDevice[dv].some((id) => d(id) === 'camera'); });
    ids.forEach((id) => {
      const s = st(id);
      if (!s) return;
      const dom = d(id);
      const dv = reg[id] && reg[id].device_id;
      // the camera's own extras (privacy, night vision, motion, pan buttons) stay inside the camera
      if (dv && isCameraDevice[dv] && dom !== 'camera') return;
      // other devices with a main part: hide their settings switches
      if (dv && hasMain[dv] && dom === 'switch') return;
      const dc = s.attributes.device_class;
      if (dom === 'climate') {
        const cur = num(s.attributes.current_temperature);
        if (cur != null && climateTemp == null) climateTemp = cur;
        const action = s.attributes.hvac_action;
        const heating = action ? action === 'heating' : ['heat', 'heat_cool', 'auto'].includes(s.state);
        const cooling = action ? action === 'cooling' : s.state === 'cool';
        if (heating) kinds.heat = true;
        if (cooling) kinds.cool = true;
        devs.push(id);
      } else if (dom === 'sensor' && dc === 'temperature') {
        const v = num(s.state);
        if (v != null && temp == null) temp = v;
      } else if (dom === 'light') {
        if (s.state === 'on') kinds.light = true;
        devs.push(id);
      } else if (dom === 'switch') {
        if (s.state === 'on' && !/child_lock|lock$/.test(id)) kinds.plug = true;
        devs.push(id);
      } else if (dom === 'fan') {
        if (s.state === 'on') kinds.fan = true;
        devs.push(id);
      } else if (dom === 'media_player') {
        if (['playing', 'on', 'paused', 'buffering'].includes(s.state)) kinds.media = true;
        devs.push(id);
      } else if (dom === 'binary_sensor' && ['door', 'window', 'opening', 'garage_door'].includes(dc)) {
        if (s.state === 'on') kinds.open = true;
        devs.push(id);
      } else if (dom === 'binary_sensor' && ['moisture', 'smoke', 'gas', 'carbon_monoxide', 'safety', 'problem'].includes(dc)) {
        if (s.state === 'on') kinds.alert = true;
        devs.push(id);
      } else if (dom === 'cover' || dom === 'lock') {
        devs.push(id);
      } else if (dom === 'camera') {
        devs.push(id);
      } else if (dom === 'alarm_control_panel') {
        if (s.state === 'triggered') kinds.alert = true;
        devs.push(id);
      }
    });
    const t = temp != null ? temp : climateTemp;
    return { id: area.area_id, name: area.name, temp: t, kinds, devs };
  }

  _signature() {
    const h = this._hass;
    if (!h) return '';
    const sun = h.states['sun.sun'];
    const wx = this._weather();
    const parts = [JSON.stringify(this._view), Object.keys(h.areas || {}).length, Object.keys(h.floors || {}).length,
      sun ? sun.attributes.elevation : '', wx ? wx.state + wx.attributes.temperature + '/' + wx.attributes.wind_speed : '', this._effects()];
    Object.keys(h.states).forEach((id) => {
      const dom = id.split('.')[0];
      if (['climate', 'light', 'switch', 'fan', 'media_player', 'binary_sensor', 'sensor', 'cover', 'lock', 'camera', 'alarm_control_panel'].includes(dom)) {
        const s = h.states[id];
        if (dom === 'sensor' && s.attributes.device_class !== 'temperature') return;
        parts.push(id + s.state + (dom === 'climate' ? s.attributes.temperature + '/' + s.attributes.current_temperature + '/' + s.attributes.hvac_action : '') + (dom === 'light' ? s.attributes.brightness + '/' + s.attributes.color_temp_kelvin + '/' + s.attributes.hs_color + '/' + s.attributes.color_mode : ''));
      }
    });
    return parts.join('|');
  }

  _weather() {
    const h = this._hass;
    const id = this._config.weather || Object.keys(h.states).find((e) => e.startsWith('weather.'));
    return id ? h.states[id] : null;
  }

  _sky() {
    const sun = this._hass && this._hass.states['sun.sun'];
    if (!sun) {
      const hr = new Date().getHours();
      return SKIES[hr < 6 || hr >= 21 ? 'night' : hr < 8 ? 'dawn' : hr < 11 ? 'morning' : hr < 15 ? 'midday' : hr < 18 ? 'afternoon' : 'sunset'];
    }
    const el = num(sun.attributes.elevation) ?? 0;
    const rising = !!sun.attributes.rising;
    if (el < -6) return SKIES.night;
    if (el < 6) return rising ? SKIES.dawn : SKIES.sunset;
    if (el < 20) return rising ? SKIES.morning : SKIES.afternoon;
    return SKIES.midday;
  }

  /* ---------- living sky: weather, season and effects ---------- */

  _effects() {
    let e = this._screen().effects || (this._config && this._config.effects) || 'balanced';
    try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) e = 'subtle'; } catch (err) { /* ignore */ }
    return ['subtle', 'balanced', 'showy'].includes(e) ? e : 'balanced';
  }

  _season() {
    const lat = this._hass && this._hass.config ? num(this._hass.config.latitude) : null;
    let m = new Date().getMonth();
    if (lat != null && lat < 0) m = (m + 6) % 12;
    return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter';
  }

  _mood(sky, wx) {
    const effects = this._effects();
    const moving = effects !== 'subtle';
    const soft = effects === 'balanced';
    const season = this._season();
    const TINT = { spring: 'rgba(120,210,140,0.14)', summer: 'rgba(255,205,90,0.14)', autumn: 'rgba(215,115,55,0.16)', winter: 'rgba(170,205,255,0.18)' };
    const st = wx ? wx.state : '';
    const rain = ['rainy', 'pouring', 'lightning-rainy', 'snowy-rainy', 'hail'].includes(st);
    const snow = ['snowy', 'snowy-rainy'].includes(st);
    const clouds = rain || snow || ['cloudy', 'partlycloudy', 'fog', 'lightning'].includes(st);
    let windy = ['windy', 'windy-variant'].includes(st);
    if (wx && !windy) {
      const ws = num(wx.attributes.wind_speed);
      const unit = String(wx.attributes.wind_speed_unit || 'km/h').toLowerCase();
      const kmh = ws == null ? null : unit.includes('mph') ? ws * 1.609 : unit.includes('m/s') ? ws * 3.6 : unit.includes('kn') ? ws * 1.852 : ws;
      if (kmh != null && kmh >= 30) windy = true;
    }
    const sunny = (st === 'sunny' || st === 'partlycloudy') && sky !== SKIES.night;
    const wash = rain ? 'rgba(35,55,105,0.30)' : snow ? 'rgba(225,238,255,0.24)' : st === 'fog' ? 'rgba(170,175,190,0.32)' : clouds ? 'rgba(110,116,135,0.28)' : sunny ? 'rgba(255,215,130,0.10)' : 'transparent';
    const parts = [`<div class="fx" style="background:${TINT[season]}"></div>`, `<div class="fx" style="background:${wash}"></div>`];
    if (moving && sunny) parts.push(`<div class="fx shimmer" style="background:${sky.sun}"></div>`);
    if (moving && clouds) {
      parts.push(`<div class="fx fxp">
        <span class="cloud" style="top:4%;animation-duration:46s;animation-delay:-12s"></span>
        <span class="cloud" style="top:30%;width:42vw;animation-duration:64s;animation-delay:-40s"></span>
        <span class="cloud" style="top:62%;width:30vw;animation-duration:55s;animation-delay:-25s"></span></div>`);
    }
    if (moving && rain) {
      let d = '';
      const n = soft ? 26 : 70;
      for (let i = 0; i < n; i++) d += `<span class="drop" style="left:${(i * (soft ? 47 : 37)) % 115}%;animation-duration:${((0.6 + (i % 5) * 0.08) * (soft ? 1.7 : 1)).toFixed(2)}s;animation-delay:-${((i * 0.137) % 1.2).toFixed(2)}s"></span>`;
      parts.push(`<div class="fx fxp">${d}</div>`);
    }
    if (moving && snow) {
      let d = '';
      const n = soft ? 22 : 55;
      for (let i = 0; i < n; i++) { const sz = 3 + (i % 4) * 2; d += `<span class="flake" style="left:${(i * 53) % 100}%;width:${sz}px;height:${sz}px;opacity:${(0.5 + (i % 3) * 0.2).toFixed(1)};animation-duration:${((7 + (i % 6)) * (soft ? 1.4 : 1)).toFixed(1)}s;animation-delay:-${((i * 0.71) % 12).toFixed(2)}s"></span>`; }
      parts.push(`<div class="fx fxp">${d}</div>`);
    }
    if (moving && windy) {
      const WAVES = ['M4 26 C40 8 70 44 106 26 S172 8 208 26 S244 40 256 22', 'M4 30 C36 14 66 40 100 28 S160 12 196 24 C220 32 240 28 236 16 C232 6 216 10 220 20', 'M4 22 C46 36 82 10 124 24 S196 36 256 20'];
      let d = '';
      const n = soft ? 4 : 9;
      for (let i = 0; i < n; i++) d += `<svg class="gust" viewBox="0 0 260 48" preserveAspectRatio="none" style="left:${(i * 29) % 72}%;top:${soft ? 10 + i * 22 : 6 + i * 10}%;width:${220 + (i % 3) * 70}px;animation-duration:${((3.4 + (i % 4) * 0.6) * (soft ? 1.5 : 1)).toFixed(1)}s;animation-delay:-${((i * 1.1) % 4).toFixed(1)}s"><path pathLength="100" d="${WAVES[i % 3]}"></path></svg>`;
      parts.push(`<div class="fx fxp">${d}</div>`);
    }
    const SEASON = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
    return {
      windy,
      key: [effects, season, st, windy, sunny, sky.name].join('|'),
      html: parts.join(''),
      cls: moving ? (soft ? 'soft' : '') : 'calm',
      season: SEASON[season]
    };
  }

  /* ---------- rendering ---------- */

  _render() {
    if (!this.shadowRoot) return;
    if (this._drag) return;
    if (this._sliding) { clearTimeout(this._slideTimer); this._slideTimer = setTimeout(() => { this._sliding = false; this._render(); }, 1500); return; }
    const h = this._hass;
    if (!h || !this._config) {
      if (!this.shadowRoot.querySelector('.root[data-shell]')) this.shadowRoot.innerHTML = `<style>${LUMEN_STYLE}</style><div class="root" style="background:#121a3d"></div>`;
      return;
    }
    const floors = this._model();
    const sky = this._sky();
    const wx = this._weather();
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const mode = this._mode();
    this._modeNow = mode;
    if (!this._booted && floors.length) { this._booted = true; this._view = this._homeView(floors); }
    const v = this._view;
    if (v.floor && !floors.some((f) => f.id === v.floor)) v.floor = null;

    const floor = v.floor ? floors.find((f) => f.id === v.floor) : null;
    let room = null;
    floors.forEach((f) => f.rooms.forEach((r) => { if (r.id === v.room) room = r; }));

    let onCount = 0;
    (floor ? [floor] : floors).forEach((f) => f.rooms.forEach((r) => { onCount += Object.keys(r.kinds).filter((k) => k !== 'alert').length ? 1 : 0; }));

    const mood = this._mood(sky, wx);
    const wxHtml = wx ? `<div class="wx glass" role="status">${esc(WX_NAMES[wx.state] || wx.state)}${mood.windy && !['windy', 'windy-variant'].includes(wx.state) ? ' &amp; windy' : ''}${wx.attributes.temperature != null ? `<span class="t">${esc(Math.round(wx.attributes.temperature))}°</span>` : ''}</div>` : '';

    let body;
    if (!floors.length) {
      body = `<div class="card"><div class="cardhead"><h1>Welcome to Lumen</h1></div><p class="empty">No rooms yet. Add floors and areas in Settings → Areas, labels &amp; zones, and give your devices an area. Lumen will draw them here.</p></div>`;
    } else if ((v.kinds || []).length) {
      body = this._tableHtml(floors, floor);
    } else if (floor) {
      body = this._floorHtml(floor, onCount);
    } else if (mode === 'phone' && this._config.phone_house === 'list') {
      body = this._phoneHouseHtml(floors, onCount);
    } else {
      body = this._houseHtml(floors, onCount);
    }

    const lift = floors.length ? `<nav class="lift glass" aria-label="Floors">
      <button class="lbtn ${!floor ? 'active' : ''}" data-act="floor" data-id="" aria-label="Whole house" aria-pressed="${!floor}">${svg('house')}</button>
      ${(mode === 'phone' ? floors : floors.slice().reverse()).map((f) => `<button class="lbtn ${floor && floor.id === f.id ? 'active' : ''}" data-act="floor" data-id="${esc(f.id)}" aria-label="${esc(f.name)}" aria-pressed="${!!(floor && floor.id === f.id)}">${esc(f.short)}</button>`).join('')}
    </nav>` : '';

    const panelKey = v.help ? 'help/' + v.help : room ? room.id + '/' + (v.entity || '') : '';
    this._opening = !!panelKey && panelKey !== this._lastPanelKey;
    this._lastPanelKey = panelKey;
    const panel = v.help === 'settings' ? this._settingsHtml(floors, mode) : v.help ? this._helpHtml(mode) : room && (mode !== 'small' || v.entity) ? this._panelHtml(room) : '';

    // remember where every scrolling list was, so redraws (a light changing somewhere) don't jump it back to the top
    const SCROLLERS = ['.panel', '.flist', '.tablewrap', '.planwrap', '.smgrid'];
    const scrolls = {};
    SCROLLERS.forEach((q) => { const el = this.shadowRoot.querySelector(q); if (el && el.scrollTop) scrolls[q] = el.scrollTop; });
    const panelWas = this._lastPanelKeyShown;
    this._lastPanelKeyShown = panelKey;
    // the sky lives in a shell that is built once, so weather effects keep running smoothly
    // while the rooms and panels above them are redrawn
    let shell = this.shadowRoot.querySelector('.root[data-shell]');
    if (!shell) {
      this.shadowRoot.innerHTML = `<style>${LUMEN_STYLE}</style>
        <div class="root" data-shell="1"><div class="sun"></div><div class="fxs"></div><div class="ui"></div></div>`;
      shell = this.shadowRoot.querySelector('.root[data-shell]');
    }
    shell.style.background = sky.bg;
    const hostR = this.getBoundingClientRect();
    shell.className = 'root ' + mood.cls + ' m-' + mode + (mode === 'phone' && hostR.width > (shell.clientHeight || window.innerHeight) ? ' wide' : '');
    shell.querySelector('.sun').style.background = sky.sun;
    const fxs = shell.querySelector('.fxs');
    if (fxs.dataset.key !== mood.key) { fxs.dataset.key = mood.key; fxs.innerHTML = mood.html; }
    const rail = floors.length && mode !== 'small' ? this._railHtml(floors) : '';
    shell.querySelector('.ui').innerHTML = mode === 'small'
      ? `<div class="smwrap">${this._smallHtml(floors, wx)}</div>${panel}`
      : `
        <div class="top">
          <div class="brand glass"><b>Lumen</b><span>${esc(time)} · ${esc(sky.name)}${mode === 'phone' ? '' : ' · ' + esc(mood.season)}</span></div>
          <div class="topr">${wxHtml}${this._config.settings === false ? '' : `<button class="setbtn" data-act="settings" aria-label="Settings and help">${svg('gear')}</button>`}</div>
        </div>
        ${rail}
        <div class="stagewrap ${rail ? '' : 'norail'}">${body}</div>
        ${lift}
        ${panel}`;
    this._attachCamera();
    Object.keys(scrolls).forEach((q) => {
      if (q === '.panel' && panelWas !== panelKey) return; // a newly opened panel starts at its top
      const el = this.shadowRoot.querySelector(q);
      if (el) el.scrollTop = scrolls[q];
    });
    this._measureTop();
    // the stacked view sizes itself from the stage, so redraw once the stage has a real size
    const st = this.shadowRoot.querySelector('.stage');
    if (st) {
      const key = st.clientWidth + 'x' + st.clientHeight;
      if (this._ro) this._ro.observe(st);
      if (key !== this._stageKey) { this._stageKey = key; requestAnimationFrame(() => this._render()); }
    }
  }

  // is this device doing something right now? (used for the rail counts)
  _isOn(id) {
    const s = this._hass.states[id];
    if (!s) return false;
    const dom = id.split('.')[0];
    if (dom === 'climate') {
      const a = s.attributes.hvac_action;
      if (a) return ['heating', 'cooling', 'drying', 'fan'].includes(a);
      return ['heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only'].includes(s.state);
    }
    if (dom === 'media_player') return ['playing', 'on', 'paused', 'buffering'].includes(s.state);
    if (dom === 'alarm_control_panel') return s.state === 'triggered';
    return s.state === 'on';
  }

  _kindOf(id) {
    const s = this._hass.states[id];
    const dom = id.split('.')[0];
    const dc = s && s.attributes.device_class;
    if (dom === 'light') return 'light';
    if (dom === 'climate') return (s.attributes.hvac_modes || []).some((m) => ['cool', 'dry', 'fan_only'].includes(m)) && !(s.attributes.hvac_modes || []).includes('heat') ? 'cool' : 'heat';
    if (dom === 'fan') return 'fan';
    if (dom === 'media_player') return 'media';
    if (dom === 'switch') return 'plug';
    if (dom === 'binary_sensor' && ['door', 'window', 'opening', 'garage_door'].includes(dc)) return 'open';
    if (dom === 'binary_sensor' || dom === 'alarm_control_panel') return 'alert';
    if (dom === 'camera') return 'camera';
    return 'other';
  }

  _railHtml(floors) {
    const KINDS = [['light', 'Lights'], ['heat', 'Heat'], ['cool', 'Cool'], ['fan', 'Fans'], ['media', 'Media'], ['open', 'Open'], ['plug', 'Plugs'], ['alert', 'Alerts']];
    const present = {};
    floors.forEach((f) => f.rooms.forEach((r) => r.devs.forEach((id) => { present[this._kindOf(id)] = true; })));
    const sel = this._view.kinds || [];
    const counts = {};
    floors.forEach((f) => f.rooms.forEach((r) => r.devs.forEach((id) => { if (this._isOn(id)) { const k = this._kindOf(id); counts[k] = (counts[k] || 0) + 1; } })));
    const icon = (k) => ({
      light: '<span class="mroom lit"></span>',
      heat: '<span class="mroom"><span class="heat"></span></span>',
      cool: '<span class="mroom"><span class="cool"></span></span>',
      fan: `<span class="badge">${svg('fan', 'class="spin"')}</span>`,
      media: `<span class="badge">${svg('media')}</span>`,
      open: `<span class="badge">${svg('door')}</span>`,
      plug: `<span class="badge">${svg('plug')}</span>`,
      alert: `<span class="mroom alert">${svg('alert')}</span>`
    }[k]);
    const btns = KINDS.filter(([k]) => present[k]).map(([k, label]) => `<button class="kbtn ${sel.includes(k) ? 'active' : ''}" data-act="kind" data-id="${k}" aria-pressed="${sel.includes(k)}" aria-label="Show all ${label.toLowerCase()}${counts[k] ? ', ' + counts[k] + ' on' : ''}">
        <span aria-hidden="true" style="display:flex;align-items:center;justify-content:center;height:28px">${icon(k)}</span><span class="klbl">${label}</span>${counts[k] ? `<span class="kcount" aria-hidden="true">${counts[k]}</span>` : ''}</button>`).join('');
    if (!btns) return '';
    const clear = (sel.length || this._view.floor) ? `<span class="raildiv" aria-hidden="true"></span><button class="kbtn" data-act="clear" aria-label="Clear and go back to the whole house"><span aria-hidden="true" style="display:flex;height:28px;align-items:center">${svg('close', 'width="20" height="20"')}</span><span class="klbl">Clear</span></button>` : '';
    return `<nav class="rail glass" aria-label="Device types">${btns}${clear}</nav>`;
  }

  _tableHtml(floors, floor) {
    const NAMES = { light: 'Lights', heat: 'Heating', cool: 'Cooling', fan: 'Fans', media: 'Media', open: 'Doors & windows', plug: 'Plugs', alert: 'Alerts' };
    const kinds = ['light', 'heat', 'cool', 'fan', 'media', 'open', 'plug', 'alert'].filter((k) => (this._view.kinds || []).includes(k));
    const scope = floor ? [floor] : floors;
    const cols = `grid-template-columns:170px repeat(${kinds.length},minmax(0,1fr))`;
    let onCount = 0;
    const head = `<div class="trow thead" style="${cols}"><span>Room</span>${kinds.map((k) => {
      const anyOn = scope.some((f) => f.rooms.some((r) => r.devs.some((id) => this._kindOf(id) === k && this._hass.states[id].state === 'on')));
      const canOff = ['light', 'plug', 'fan'].includes(k) && anyOn;
      return `<div class="colhead"><span>${NAMES[k]}</span>${canOff ? `<button class="pill small" data-act="alloff" data-id="${k}" aria-label="Turn all ${NAMES[k].toLowerCase()} off">All off</button>` : ''}</div>`;
    }).join('')}</div>`;
    const groups = scope.map((f) => {
      const rows = f.rooms.filter((r) => r.devs.some((id) => kinds.includes(this._kindOf(id)))).map((r) => {
        this._panelRoomName = r.name;
        const cells = kinds.map((k) => {
          const ids = r.devs.filter((id) => this._kindOf(id) === k);
          if (!ids.length) return '<div class="cell"><span style="color:#9c97b8">–</span></div>';
          return `<div class="cell">${ids.map((id) => {
            const s = this._hass.states[id];
            const dom = id.split('.')[0];
            const on = s.state === 'on' || (dom === 'climate' && ['heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only'].includes(s.state));
            if (on) onCount++;
            const label = this._stateText(id);
            if (dom === 'climate') return `<button class="chip ${on ? 'on' : ''}" data-act="open-entity" data-room="${esc(r.id)}" data-id="${esc(id)}">${esc(this._name(id))}<span class="st">${esc(label)}</span></button>`;
            if (['light', 'switch', 'fan'].includes(dom) && !['unavailable', 'unknown'].includes(s.state)) return `<button class="chip ${on ? 'on' : ''}" data-act="toggle" data-id="${esc(id)}" aria-pressed="${on}">${esc(this._name(id))}<span class="st">${on ? 'On' : 'Off'}</span></button>`;
            return `<span class="chip static ${on ? 'on' : ''}">${esc(this._name(id))}<span class="st">${esc(label)}</span></span>`;
          }).join('')}</div>`;
        }).join('');
        return `<div class="trow" style="${cols}"><button class="rname" data-act="room" data-id="${esc(r.id)}">${esc(r.name)}<span>${r.temp != null ? esc(fmtT(r.temp)) : ''}</span></button>${cells}</div>`;
      }).join('');
      return rows ? `<div class="tfloor">${esc(f.name)}</div>${rows}` : '';
    }).join('');
    return `<div class="card">
      <div class="cardhead"><h1>${kinds.map((k) => NAMES[k]).join(' + ')}</h1><div class="headbtns"><span style="font-size:14px;color:#cfcae6">${floor ? esc(floor.name) : 'Whole house'} · ${onCount} on</span><button class="pill small" data-act="kinds-done">Back to map</button></div></div>
      <div class="tablewrap">${head}${groups || '<p class="empty" style="margin:14px">Nothing of this type here.</p>'}</div>
    </div>`;
  }

  _badges(r, max) {
    const order = [['alert', 'alert'], ['open', 'door'], ['fan', 'fan'], ['media', 'media'], ['plug', 'plug']];
    const on = order.filter(([k]) => r.kinds[k]);
    const shown = on.slice(0, max).map(([k, icon]) => `<span class="badge" ${k === 'alert' ? 'style="color:#ff8a8a"' : ''}>${svg(icon, k === 'fan' ? 'class="spin"' : '')}</span>`).join('');
    const more = on.length - max;
    return on.length ? `<span class="badges" aria-hidden="true">${shown}${more > 0 ? `<span class="badge">+${more}</span>` : ''}</span>` : '';
  }

  _roomCls(r) {
    return 'room' + (r.kinds.light ? ' on' : '') + (r.kinds.alert ? ' alert' : '');
  }

  _summary(r) {
    const bits = [];
    if (r.kinds.light) bits.push('lights on');
    if (r.kinds.heat) bits.push('heating');
    if (r.kinds.cool) bits.push('cooling');
    if (r.kinds.media) bits.push('media on');
    if (r.kinds.open) bits.push('something open');
    if (r.kinds.alert) bits.push('alert');
    return bits.length ? bits.join(', ') : 'all quiet';
  }

  _layout(n) {
    // simple automatic floor plan until the room-drawing setup exists
    const cols = Math.max(1, Math.min(n, Math.ceil(Math.sqrt(n * 1.6))));
    const rows = Math.ceil(n / cols);
    const gap = 2;
    const cells = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols);
      const inRow = row === rows - 1 ? n - row * cols : cols;
      const col = i - row * cols;
      const w = (100 - gap * (inRow - 1)) / inRow;
      const hgt = (100 - gap * (rows - 1)) / rows;
      cells.push({ x: col * (w + gap), y: row * (hgt + gap), w, h: hgt });
    }
    return cells;
  }

  // Saved room positions live in the card config: layout: { <area_id>: [x, y, w, h] } in % of the floor.
  // Rooms without a saved position are placed automatically.
  _cellsFor(floor) {
    const saved = (this._edit && this._edit.floor === floor.id) ? this._edit.draft : ((this._config && this._config.layout) || {});
    const auto = this._layout(floor.rooms.length);
    const anySaved = floor.rooms.some((r) => Array.isArray(saved[r.id]));
    if (!anySaved) return auto;
    const placed = [];
    const cells = floor.rooms.map((r) => {
      const c = saved[r.id];
      if (Array.isArray(c) && c.length === 4) { const cell = { x: +c[0], y: +c[1], w: +c[2], h: +c[3] }; placed.push(cell); return cell; }
      return null;
    });
    // a room added since the plan was drawn gets the first free 20% x 20% spot
    return cells.map((cell) => {
      if (cell) return cell;
      const free = this._freeSpot(placed, 20, 20);
      placed.push(free);
      return free;
    });
  }

  _freeSpot(placed, w, h) {
    const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    for (let y = 0; y <= 100 - h; y += 5) {
      for (let x = 0; x <= 100 - w; x += 5) {
        const c = { x, y, w, h };
        if (!placed.some((p) => hit(c, p))) return c;
      }
    }
    return { x: 0, y: 0, w, h };
  }

  _roomBtn(r, cell, plan) {
    const aria = `${r.name}${r.temp != null ? ', ' + fmtT(r.temp) : ''}, ${this._summary(r)}`;
    const len = Math.max(...String(r.name).split(/\s+/).map((w) => w.length), 1);
    return `<button class="${this._roomCls(r)}" style="left:${cell.x}%;top:${cell.y}%;width:${cell.w}%;height:${cell.h}%;--len:${len}" data-act="room" data-id="${esc(r.id)}" aria-label="${esc(aria)}">
      ${r.kinds.heat ? '<span class="heat" aria-hidden="true"></span>' : ''}${r.kinds.cool ? '<span class="cool" aria-hidden="true"></span>' : ''}
      ${this._badges(r, plan ? 3 : 2)}
      ${plan ? `<span class="rn">${esc(r.name)}</span><span class="sum">${this._modeNow === 'phone' ? (r.temp != null ? esc(fmtT(r.temp)) : '') : (r.temp != null ? esc(fmtT(r.temp)) + ' · ' : '') + esc(this._summary(r))}</span>` : ''}
    </button>`;
  }

  /* ---------- phone: floors as a list of flat plans, top floor first ---------- */

  _phoneHouseHtml(floors, onCount) {
    const secs = floors.slice().reverse().map((f) => {
      const on = f.rooms.filter((r) => Object.keys(r.kinds).some((k) => k !== 'alert')).length;
      const cells = this._cellsFor(f);
      return `<section class="fsec">
        <button class="fhead" data-act="floor" data-id="${esc(f.id)}" aria-label="Open ${esc(f.name)}"><span class="fbadge" aria-hidden="true">${esc(f.short)}</span>${esc(f.name)}<span class="fsub">${on ? on + ' on' : 'all quiet'}</span></button>
        <div class="plan">${f.rooms.map((r, k) => this._roomBtn(r, cells[k], true)).join('')}</div>
      </section>`;
    }).join('');
    return `<div class="card">
      <div class="cardhead"><h1>Whole house</h1><span>${onCount} ${onCount === 1 ? 'room' : 'rooms'} with something on</span></div>
      <div class="flist">${secs}</div>
    </div>`;
  }

  /* ---------- small square screens: one thing at a time, big buttons ---------- */

  _smallHtml(floors, wx) {
    const v = this._view;
    let room = null, roomFloor = null;
    floors.forEach((f) => f.rooms.forEach((r) => { if (r.id === v.room) { room = r; roomFloor = f; } }));
    const floor = v.floor ? floors.find((f) => f.id === v.floor) : null;
    const up = (label) => `<button class="smbtn" data-act="sm-up" aria-label="Back to ${esc(label)}">${svg('back')}<span>${esc(label)}</span></button>`;
    const lit = (r) => Object.keys(r.kinds).some((k) => k !== 'alert');
    if (room) {
      this._panelRoomName = room.name;
      const tiles = room.devs.map((id) => this._tileHtml(id)).join('');
      return `<div class="smtop">${up(roomFloor && floors.length > 1 ? roomFloor.name : 'House')}<h1>${esc(room.name)}</h1>${room.temp != null ? `<span class="smt">${esc(fmtT(room.temp))}</span>` : ''}${this._starBtn(room, true)}</div>
        <div class="smgrid">${tiles || '<p class="empty" style="grid-column:1/-1">No devices in this room yet.</p>'}</div>`;
    }
    if (floor) {
      const tiles = floor.rooms.map((r) => `<button class="tile ${r.kinds.light ? 'on' : ''} ${r.kinds.alert ? 'alert' : ''}" data-act="room" data-id="${esc(r.id)}" aria-label="${esc(r.name + (r.temp != null ? ', ' + fmtT(r.temp) : '') + ', ' + this._summary(r))}">
          ${r.kinds.heat ? '<span class="heat" aria-hidden="true"></span>' : ''}${r.kinds.cool ? '<span class="cool" aria-hidden="true"></span>' : ''}
          <span class="tn">${esc(r.name)}</span><span class="ts">${r.temp != null ? esc(fmtT(r.temp)) + ' · ' : ''}${esc(this._summary(r))}</span></button>`).join('');
      return `<div class="smtop">${up('House')}<h1>${esc(floor.name)}</h1></div><div class="smgrid">${tiles}</div>`;
    }
    if (floors.length === 1) { this._view.floor = floors[0].id; return this._smallHtml(floors, wx); }
    const tiles = floors.slice().reverse().map((f) => {
      const on = f.rooms.filter(lit).length;
      return `<button class="tile big ${on ? 'on' : ''}" data-act="floor" data-id="${esc(f.id)}"><span class="fbadge" aria-hidden="true">${esc(f.short)}</span><span class="tn">${esc(f.name)}</span><span class="ts">${on ? on + ' on' : 'all quiet'}</span></button>`;
    }).join('');
    const fav = this._fav();
    const favRoom = fav && floors.reduce((a, f) => a || f.rooms.find((r) => r.id === fav), null);
    return `<div class="smtop" style="padding-left:16px"><h1>Lumen</h1>${this._config.settings === false ? '' : `<button class="setbtn" data-act="settings" aria-label="Settings and help">${svg('gear')}</button>`}${wx && wx.attributes.temperature != null ? `<span class="smsub">${esc(WX_NAMES[wx.state] || wx.state)}</span><span class="smt">${esc(Math.round(wx.attributes.temperature))}°</span>` : ''}${favRoom ? `<button class="smbtn on" data-act="room" data-id="${esc(favRoom.id)}" aria-label="Back to ${esc(favRoom.name)}">${svg('star')}</button>` : ''}</div>
      <div class="smgrid one">${tiles}</div>`;
  }

  // one device as a big tile: tap to switch it, or to open its controls
  _tileHtml(id) {
    const s = this._hass.states[id];
    if (!s) return '';
    const dom = id.split('.')[0];
    const dead = ['unavailable', 'unknown'].includes(s.state);
    const on = this._isOn(id);
    const icon = { light: 'bulb', climate: 'heat', camera: 'camera', media_player: 'media', fan: 'fan', switch: 'plug', binary_sensor: 'door', alarm_control_panel: 'alert' }[dom] || 'plug';
    const opens = dom === 'climate' || dom === 'camera';
    const toggles = ['light', 'switch', 'fan'].includes(dom) && !dead;
    const more = dom === 'light' && !dead && this._lightCaps(s).dim;
    const heatTint = dom === 'climate' && on ? (s.attributes.hvac_action === 'cooling' || s.state === 'cool' ? '<span class="cool" aria-hidden="true"></span>' : '<span class="heat" aria-hidden="true"></span>') : '';
    const lit = (dom === 'light' || dom === 'switch' || dom === 'fan') && on;
    const alert = (dom === 'alarm_control_panel' || (dom === 'binary_sensor' && !['door', 'window', 'opening', 'garage_door'].includes(s.attributes.device_class))) && on;
    const act = toggles ? `data-act="toggle" aria-pressed="${on}"` : opens ? 'data-act="entity"' : '';
    const tag = act ? 'button' : 'div';
    return `<div style="position:relative;display:flex;min-width:0">
      <${tag} class="tile ${lit ? 'on' : ''} ${alert ? 'alert' : ''} ${act ? '' : 'static'}" style="flex:1 1 auto" ${act} data-id="${esc(id)}" aria-label="${esc(this._name(id) + ', ' + this._stateText(id))}">
        ${heatTint}<span class="tic" aria-hidden="true">${svg(icon)}</span>
        <span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="tn">${esc(this._name(id))}</span><span class="ts">${esc(this._stateText(id))}</span></span>
      </${tag}>
      ${more ? `<button class="more" data-act="entity" data-id="${esc(id)}" aria-label="Brightness and colour for ${esc(this._name(id))}">${svg('right')}</button>` : ''}
    </div>`;
  }

  _houseHtml(floors, onCount) {
    const stage = this._stageSize();
    const n = floors.length;
    const rx = n >= 5 ? 66 : 60;
    const cosr = Math.cos(rx * Math.PI / 180);
    const phU = (400 * 0.5 + 290 * 0.866) * cosr;
    const pwU = 400 * 0.866 + 290 * 0.5;
    // Try a few arrangements. For each, lay the floors out at scale 1, measure the
    // true outline of every slanted floor (plus room for its badge), then scale the
    // whole house to fill the stage. Keep whichever arrangement ends up biggest.
    const C30 = Math.cos(Math.PI / 6), S30 = 0.5;
    const corners = [[200, 145], [200, -145], [-200, 145], [-200, -145]].map(([u, v]) => [u * C30 + v * S30, (-u * S30 + v * C30) * cosr]);
    const pw1 = pwU, ph1 = phU;
    const arrangements = [];
    const col = []; for (let i = 0; i < n; i++) col.push({ x: 0, y: -i * (ph1 + 20), side: 'left' });
    arrangements.push(col);
    if (n >= 2) {
      for (const sp of [0.55, 0.65, 0.75, 0.85, 1.0]) {
        for (const vy of [0.45, 0.55, 0.65, 0.8]) {
          const zig = []; for (let i = 0; i < n; i++) zig.push({ x: i % 2 ? pw1 * sp : 0, y: -i * (ph1 * vy), side: i % 2 ? 'right' : 'left' });
          arrangements.push(zig);
        }
      }
      for (const dx of [0.6, 0.75, 0.9, 1.05]) {
        for (const dy of [0.15, 0.3, 0.45, 0.6]) {
          const st = []; for (let i = 0; i < n; i++) st.push({ x: i * pw1 * dx, y: -i * ph1 * dy, side: 'top' });
          arrangements.push(st);
        }
      }
    }
    const BADGE = 40, MARGIN = 10;
    // floors must never overlap: test each pair of slanted outlines (separating-axis test, with a small gap)
    const quad = [corners[3], corners[1], corners[0], corners[2]];
    const axes = [[quad[1][0] - quad[0][0], quad[1][1] - quad[0][1]], [quad[3][0] - quad[0][0], quad[3][1] - quad[0][1]]].map(([x, y]) => { const l = Math.hypot(x, y); return [-y / l, x / l]; });
    const clash = (a, b) => axes.every(([ax, ay]) => {
      const pa = quad.map(([x, y]) => (a.x + x) * ax + (a.y + y) * ay), pb = quad.map(([x, y]) => (b.x + x) * ax + (b.y + y) * ay);
      return Math.min(...pa) < Math.max(...pb) + 14 && Math.min(...pb) < Math.max(...pa) + 14;
    });
    const overlaps = (arr) => arr.some((a, i) => arr.some((b, j) => j > i && clash(a, b)));
    let best = null;
    arrangements.forEach((arr) => {
      if (overlaps(arr)) return;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, padL = 0, padR = 0, padT = 0;
      arr.forEach((c) => corners.forEach(([cx, cy]) => {
        x0 = Math.min(x0, c.x + cx); x1 = Math.max(x1, c.x + cx);
        y0 = Math.min(y0, c.y + cy); y1 = Math.max(y1, c.y + cy);
      }));
      if (arr.some((c) => c.side === 'left')) padL = BADGE;
      if (arr.some((c) => c.side === 'right')) padR = BADGE;
      if (arr.some((c) => c.side === 'top')) padT = BADGE;
      const sc = Math.min((stage.w - padL - padR - 2 * MARGIN) / (x1 - x0), (stage.h - padT - 2 * MARGIN) / (y1 - y0));
      if (!best || sc > best.sc * 1.02) best = { arr, sc, x0, x1, y0, y1, padL, padR, padT };
    });
    const sc = Math.max(0.2, Math.min(best.sc, 1.8));
    const W = Math.round(400 * sc), H = Math.round(290 * sc);
    const ph = phU * sc, pw = pwU * sc;
    const tf = Math.max(15, Math.min(36, Math.round(26 * sc)));
    const tiny = W < 230;
    const usedW = (best.x1 - best.x0) * sc, usedH = (best.y1 - best.y0) * sc;
    const offX = best.padL + (stage.w - best.padL - best.padR - usedW) / 2 - best.x0 * sc;
    const offY = best.padT + (stage.h - best.padT - usedH) / 2 - best.y0 * sc;
    const place = (i) => ({ cx: offX + best.arr[i].x * sc, cy: offY + best.arr[i].y * sc, side: best.arr[i].side });
    // one name size for the whole house: the largest size at which every room's longest word fits
    const fitOf = (r, c) => {
      const maxW = Math.max(40, Math.round(c.w / 100 * (W - 20) - 10));
      const longest = Math.max(...String(r.name).split(/\s+/).map((w) => w.length), 1);
      return Math.floor((maxW - 12) / (longest * 0.58));
    };
    // Two sizes at most: one for most rooms, and one smaller size shared by the few rooms too narrow for it.
    const fits = [];
    floors.forEach((f) => { const cs = this._cellsFor(f); f.rooms.forEach((r, k) => fits.push(fitOf(r, cs[k]))); });
    const sorted = fits.slice().sort((a, b) => a - b);
    const houseFs = Math.max(18, Math.min(tf, sorted[Math.floor(sorted.length * 0.2)] || tf));
    const smallFs = Math.max(12, Math.min(houseFs, sorted[0] || houseFs));
    const sizeFor = (r, c) => (fitOf(r, c) >= houseFs ? houseFs : smallFs);
    const plates = floors.map((f, i) => {
      const { cx, cy, side } = place(i);
      const cells = this._cellsFor(f);
      // where a point on the flat floor lands on screen (same maths as the CSS tilt)
      const proj = (u, v) => [pw / 2 + u * C30 + v * S30, ph / 2 + (-u * S30 + v * C30) * cosr];
      const tags = f.rooms.map((r, k) => {
        const c = cells[k];
        const u = 10 + (c.x + c.w / 2) / 100 * (W - 20) - W / 2;
        const v = 10 + (c.y + c.h / 2) / 100 * (H - 20) - H / 2;
        const [x, y] = proj(u, v);
        const maxW = Math.max(40, Math.round(c.w / 100 * (W - 20) - 10));
        const name = tiny ? '' : `<span class="tn" style="max-width:${Math.max(maxW, 60)}px;font-size:${sizeFor(r, c)}px">${esc(r.name)}</span>`;
        const t = r.temp != null ? `<span class="tt" style="font-size:${houseFs}px">${esc(fmtT(r.temp))}</span>` : '';
        return name || t ? `<div class="tag" style="left:${Math.round(x)}px;top:${Math.round(y)}px" aria-hidden="true">${name}${t}</div>` : '';
      }).join('');
      let corner, off;
      if (side === 'right') { corner = proj(W / 2, H / 2); off = [26, 0]; }
      else if (side === 'top') { corner = proj(W / 2, -H / 2); off = [0, -24]; }
      else { corner = proj(-W / 2, -H / 2); off = [-26, 0]; }
      const bx = Math.round(corner[0] + off[0]), by = Math.round(corner[1] + off[1]);
      return `<div class="plate" style="left:${Math.round(cx - pw / 2)}px;top:${Math.round(cy - ph / 2)}px;width:${Math.round(pw)}px;height:${Math.round(ph)}px;z-index:${i + 1}">
        <span class="plabel" style="left:${bx}px;top:${by}px" aria-hidden="true">${esc(f.short)}</span>
        ${tags}
        <div class="floor ${f.below ? 'below' : ''}" style="width:${W}px;height:${H}px;transform:translate(-50%,-50%) rotateX(${rx}deg) rotateZ(-30deg)">
          <div class="rooms">${f.rooms.map((r, k) => this._roomBtn(r, cells[k], false)).join('')}</div>
        </div>
      </div>`;
    }).join('');
    const rf = tf;
    return `<div class="card">
      <div class="cardhead"><h1>Whole house</h1><span>${onCount} ${onCount === 1 ? 'room' : 'rooms'} with something on</span></div>
      <div class="stage ${tiny ? 'tiny' : ''}" style="--rf:${rf}px;--tf:${tf}px;--rx:${rx}deg">${plates}</div>
      <p class="hint">Tap a room to open it. Use the floor buttons to change floor.</p>
    </div>`;
  }

  _floorHtml(floor, onCount) {
    const cells = this._cellsFor(floor);
    const editing = this._edit && this._edit.floor === floor.id;
    const canEdit = !!(this._hass.user && this._hass.user.is_admin) && this._modeNow === 'full';
    const head = editing
      ? `<div class="headbtns">
          ${this._edit.msg ? `<span class="savemsg" role="status">${esc(this._edit.msg)}</span>` : ''}
          <button class="pill small" data-act="edit-auto">Reset to automatic</button>
          <button class="pill small" data-act="edit-cancel">Cancel</button>
          <button class="pill small warm" data-act="edit-save">Save layout</button>
        </div>`
      : `<div class="headbtns"><span style="font-size:14px;color:#cfcae6">${onCount} ${onCount === 1 ? 'room' : 'rooms'} with something on</span>
          ${canEdit ? '<button class="pill small" data-act="edit-start" aria-label="Draw this floor\u2019s rooms">Edit layout</button>' : ''}</div>`;
    const hit = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0.5 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 0.5;
    const clashes = editing ? cells.map((c, i) => cells.some((o, j) => j !== i && hit(c, o))) : [];
    const nClash = clashes.filter(Boolean).length;
    const tiles = floor.rooms.map((r, k) => {
      if (!editing) return this._roomBtn(r, cells[k], true);
      const c = cells[k];
      return `<div class="room edit ${clashes[k] ? 'clash' : ''}" data-edit="${esc(r.id)}" style="left:${c.x}%;top:${c.y}%;width:${c.w}%;height:${c.h}%" role="group" aria-label="${esc(r.name)}">
        <span class="rn">${esc(r.name)}</span><span class="sum">${Math.round(c.w)}% × ${Math.round(c.h)}%</span>
        <span class="handle" data-handle="1" aria-hidden="true"></span>
      </div>`;
    }).join('');
    return `<div class="card">
      <div class="cardhead"><h1>${esc(floor.name)}</h1>${head}</div>
      <div class="planwrap"><div class="plan ${editing ? 'editing' : ''}">${tiles}</div></div>
      ${editing ? `<p class="hint">${nClash ? `<span style="color:#ff8a8a">${nClash} rooms overlap (shown in red).</span> ` : ''}Drag a room to move it. Drag its bottom-right corner to resize. Rooms snap to the grid.</p>` : ''}
    </div>`;
  }

  /* ---------- drawing rooms ---------- */

  _startEdit(floorId) {
    const floors = this._model();
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return;
    const cells = this._cellsFor(floor);
    const draft = {};
    floor.rooms.forEach((r, k) => { const c = cells[k]; draft[r.id] = [c.x, c.y, c.w, c.h].map((n) => Math.round(n * 10) / 10); });
    this._edit = { floor: floorId, draft, msg: '' };
  }

  _onPointerDown(ev) {
    if (!this._edit) return;
    const tile = ev.target.closest && ev.target.closest('[data-edit]');
    if (!tile) return;
    const plan = this.shadowRoot.querySelector('.plan');
    const rect = plan.getBoundingClientRect();
    const id = tile.dataset.edit;
    const start = this._edit.draft[id].slice();
    this._drag = { id, tile, rect, start, mode: ev.target.closest('[data-handle]') ? 'size' : 'move', x0: ev.clientX, y0: ev.clientY };
    tile.classList.add('dragging');
    try { tile.setPointerCapture(ev.pointerId); } catch (e) { /* older browsers */ }
    ev.preventDefault();
  }

  _onPointerMove(ev) {
    const d = this._drag;
    if (!d) return;
    const SNAP = 2.5;
    const snap = (n) => Math.round(n / SNAP) * SNAP;
    const dx = (ev.clientX - d.x0) / d.rect.width * 100;
    const dy = (ev.clientY - d.y0) / d.rect.height * 100;
    let [x, y, w, h] = d.start;
    if (d.mode === 'move') {
      x = Math.max(0, Math.min(100 - w, snap(x + dx)));
      y = Math.max(0, Math.min(100 - h, snap(y + dy)));
    } else {
      w = Math.max(10, Math.min(100 - x, snap(w + dx)));
      h = Math.max(10, Math.min(100 - y, snap(h + dy)));
    }
    d.now = [x, y, w, h];
    Object.assign(d.tile.style, { left: x + '%', top: y + '%', width: w + '%', height: h + '%' });
    const sum = d.tile.querySelector('.sum');
    if (sum) sum.textContent = Math.round(w) + '% × ' + Math.round(h) + '%';
  }

  _onPointerUp() {
    const d = this._drag;
    if (!d) return;
    this._drag = null;
    if (d.now) this._edit.draft[d.id] = d.now;
    this._edit.msg = '';
    this._sig = '';
    this._render();
  }

  async _saveLayout() {
    const e = this._edit;
    if (!e) return;
    const layout = Object.assign({}, (this._config && this._config.layout) || {}, e.draft);
    // show it straight away, then store it in the dashboard so every screen gets the same plan
    this._config = Object.assign({}, this._config, { layout });
    try {
      const seg = (window.location.pathname.split('/')[1] || '').trim();
      const urlPath = !seg || seg === 'lovelace' ? null : seg;
      const conn = this._hass.connection;
      const cfg = await conn.sendMessagePromise({ type: 'lovelace/config', url_path: urlPath });
      let found = 0;
      const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(walk); return; }
        if (node.type === 'custom:lumen-card') { node.layout = layout; found++; }
        ['views', 'cards', 'sections', 'card'].forEach((k) => { if (node[k]) walk(node[k]); });
      };
      walk(cfg);
      if (!found) throw new Error('Lumen card not found on this dashboard');
      await conn.sendMessagePromise({ type: 'lovelace/config/save', url_path: urlPath, config: cfg });
      this._edit = null;
    } catch (err) {
      e.msg = 'Not saved: ' + ((err && (err.message || err.code)) || 'unknown error') + '. If this dashboard uses YAML, paste the layout in by hand.';
      console.warn('Lumen: layout not saved', err, JSON.stringify(layout));
    }
    this._sig = '';
    this._render();
  }

  _stageSize() {
    const st = this.shadowRoot && this.shadowRoot.querySelector('.stage');
    if (st && st.clientWidth > 50 && st.clientHeight > 50) return { w: st.clientWidth, h: st.clientHeight };
    const host = this.getBoundingClientRect();
    const w = Math.max(320, (host.width || window.innerWidth) - 208 - 52);
    const h = Math.max(220, (host.height || window.innerHeight) - 86 - 56 - 40 - 56 - 50);
    return { w, h };
  }

  /* ---------- room and device panels ---------- */

  _name(id) {
    const s = this._hass.states[id];
    const reg = (this._hass.entities || {})[id];
    let n = (s && s.attributes.friendly_name) || id;
    // some integrations repeat the name ("Lollie room radiator Lollie room radiator")
    const words = n.split(' ');
    for (let k = 1; k <= words.length / 2; k++) {
      const head = words.slice(0, k).join(' ').toLowerCase();
      const tail = words.slice(k).join(' ').toLowerCase();
      if (tail.startsWith(head) && tail === words.slice(k, 2 * k).join(' ').toLowerCase() + (words.length > 2 * k ? ' ' + words.slice(2 * k).join(' ').toLowerCase() : '')) {
        if (words.slice(k, 2 * k).join(' ').toLowerCase() === head) { n = words.slice(k).join(' '); break; }
      }
    }
    const room = this._panelRoomName;
    if (room && n.toLowerCase().startsWith(room.toLowerCase() + ' ')) {
      const rest = n.slice(room.length + 1);
      if (rest.length > 2) n = rest.charAt(0).toUpperCase() + rest.slice(1);
    }
    return reg && reg.name ? reg.name : n;
  }

  _stateText(id) {
    const s = this._hass.states[id];
    if (!s) return '';
    if (['unavailable', 'unknown'].includes(s.state) && id.split('.')[0] !== 'climate') return s.state === 'unavailable' ? 'Unavailable' : 'Unknown';
    const dom = id.split('.')[0];
    if (dom === 'climate') {
      const cur = num(s.attributes.current_temperature);
      const set = num(this._pending[id] ?? s.attributes.temperature);
      const mode = s.state === 'off' ? 'Off' : s.state === 'heat' ? 'Heating to ' + fmtT(set) : ['unknown', 'unavailable'].includes(s.state) ? 'Set to ' + fmtT(set) : s.state;
      return (cur != null ? 'Room ' + fmtT(cur) + ' · ' : '') + mode;
    }
    if (dom === 'light') {
      if (s.state !== 'on') return 'Off';
      const b = num(s.attributes.brightness);
      return b != null ? 'On · ' + Math.round(b / 2.55) + '%' : 'On';
    }
    if (dom === 'camera') return 'Camera · ' + ({ idle: 'Watching', recording: 'Recording', streaming: 'Streaming' }[s.state] || (s.state.charAt(0).toUpperCase() + s.state.slice(1)));
    if (dom === 'alarm_control_panel') return { disarmed: 'Disarmed', armed_home: 'Armed (home)', armed_away: 'Armed (away)', armed_night: 'Armed (night)', armed_vacation: 'Armed (holiday)', arming: 'Arming…', pending: 'Pending…', triggered: 'ALARM!' }[s.state] || s.state;
    if (dom === 'media_player') return s.state === 'playing' ? 'Playing' + (s.attributes.media_title ? ' · ' + s.attributes.media_title : '') : s.state.charAt(0).toUpperCase() + s.state.slice(1);
    if (dom === 'binary_sensor') return s.state === 'on' ? (s.attributes.device_class === 'moisture' ? 'Wet!' : 'Open') : (s.attributes.device_class === 'moisture' ? 'Dry' : 'Closed');
    return s.state === 'on' ? 'On' : s.state === 'off' ? 'Off' : s.state;
  }

  _panelHtml(room) {
    this._panelRoomName = room.name;
    const ent = this._view.entity;
    if (ent && this._hass.states[ent] && ent.startsWith('climate.')) return this._climateHtml(room, ent);
    if (ent && this._hass.states[ent] && ent.startsWith('light.')) return this._lightHtml(room, ent);
    if (ent && this._hass.states[ent] && ent.startsWith('camera.')) return this._cameraHtml(room, ent);
    const rows = room.devs.map((id) => {
      const dom = id.split('.')[0];
      const s = this._hass.states[id];
      const canToggle = ['light', 'switch', 'fan'].includes(dom) && s && !['unavailable', 'unknown'].includes(s.state);
      const isClimate = dom === 'climate' || dom === 'camera' || (dom === 'light' && s && !['unavailable', 'unknown'].includes(s.state) && this._lightCaps(s).dim);
      return `<div class="dev">
        <button class="dopen ${isClimate ? 'go' : ''}" ${isClimate ? `data-act="entity" data-id="${esc(id)}" aria-label="Open controls for ${esc(this._name(id))}"` : 'tabindex="-1"'}>
          <span class="nm">${esc(this._name(id))}</span><span class="sm">${esc(this._stateText(id))}</span>
        </button>
        ${isClimate ? `<button class="pill" data-act="entity" data-id="${esc(id)}">${dom === 'camera' ? svg('camera', 'width="16" height="16"') + 'View' : 'Controls'}</button>` : ''}
        ${canToggle ? `<button class="pill ${s.state === 'on' ? 'warm' : ''}" data-act="toggle" data-id="${esc(id)}" aria-pressed="${s.state === 'on'}">${s.state === 'on' ? 'On' : 'Off'}</button>` : ''}
      </div>`;
    }).join('');
    return `<div class="shade ${this._opening ? 'opening' : ''}" data-act="close-bg"><div class="panel ${this._opening ? 'opening' : ''}" role="dialog" aria-modal="true" aria-label="${esc(room.name)}">
      <div class="phead">
        <button class="pill" data-act="close" aria-label="Close">${svg('close', 'width="16" height="16"')}<span>Close</span></button>
        <h2>${esc(room.name)}</h2>
        <div class="right">
          ${room.temp != null ? `<span class="ptemp">${esc(fmtT(room.temp))}</span>` : ''}
          ${this._starBtn(room)}
        </div>
      </div>
      ${rows ? `<div class="devs">${rows}</div>` : '<p class="empty">No devices in this room yet. Give a device this area in Home Assistant and it will appear here.</p>'}
    </div></div>`;
  }

  /* ---------- settings: discreet, behind the gear ---------- */

  _settingsHtml(floors, mode) {
    const sc = this._screen();
    const pills = (key, cur, opts) => `<div class="opts">${opts.map(([val, label]) => `<button class="pill ${cur === val ? 'on' : ''}" data-act="set" data-key="${key}" data-val="${val}" aria-pressed="${cur === val}">${label}</button>`).join('')}</div>`;
    const fav = this._fav() || '';
    const rooms = floors.map((f) => `<optgroup label="${esc(f.name)}">${f.rooms.map((r) => `<option value="${esc(r.id)}" ${r.id === fav ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</optgroup>`).join('');
    const mins = String(this._returnMins());
    return `<div class="shade ${this._opening ? 'opening' : ''}" data-act="close-bg"><div class="panel help ${this._opening ? 'opening' : ''}" role="dialog" aria-modal="true" aria-label="Settings">
      <div class="phead">
        <button class="pill" data-act="help-close" aria-label="Close">${svg('close', 'width="16" height="16"')}<span>Close</span></button>
        <h2>Settings</h2>
        <div class="right"><button class="pill" data-act="help">${svg('book', 'width="16" height="16"')}<span>How to use Lumen</span></button></div>
      </div>
      <div class="hsec hnow"><p>These settings are saved on <b>this screen only</b>, so each tablet or phone can be set up its own way.</p></div>
      <div class="hsec setrow"><span class="lbl">Sky effects</span>${pills('effects', this._effects(), [['subtle', 'Subtle'], ['balanced', 'Balanced'], ['showy', 'Showy']])}<span class="shint">How much the rain, snow and clouds move.</span></div>
      <div class="hsec setrow"><span class="lbl">Layout</span>${pills('mode', sc.mode || 'auto', [['auto', 'Automatic'], ['full', 'Big'], ['phone', 'Phone'], ['small', 'Small']])}<span class="shint">Automatic picks by screen size. This screen is using the ${mode === 'full' ? 'big' : mode} layout now.</span></div>
      ${mode === 'phone' ? '' : `<div class="hsec setrow"><span class="lbl">This screen's room</span>
        <select data-key="room" aria-label="This screen's room"><option value="" ${fav ? '' : 'selected'}>None: open on the whole house</option>${rooms}</select>
        <span class="shint">The room this screen opens on. You can also tap the star inside a room.</span></div>
      <div class="hsec setrow"><span class="lbl">Go back after</span>${pills('return_after', mins, [['0', 'Never'], ['2', '2 min'], ['5', '5 min'], ['10', '10 min'], ['30', '30 min']])}<span class="shint">How long without a touch before the screen goes back to ${fav ? 'its room' : 'the whole house'}.</span></div>`}
      <p class="setfoot">Lumen ${esc(LUMEN_VERSION)}</p>
    </div></div>`;
  }

  /* ---------- how to use Lumen ---------- */

  _helpHtml(mode) {
    const admin = !!(this._hass.user && this._hass.user.is_admin);
    const names = { full: 'big screen', phone: 'phone', small: 'small screen' };
    const row = (what, f, p, sm) => `<tr><td>${what}</td>${[['full', f], ['phone', p], ['small', sm]].map(([m, ok]) => `<td class="${ok ? 'y' : 'n'} ${m === mode ? 'cur' : ''}">${ok ? 'Yes' : 'No'}</td>`).join('')}</tr>`;
    const head = ['full', 'phone', 'small'].map((m) => `<th class="${m === mode ? 'cur' : ''}">${m === 'full' ? 'Big' : m === 'phone' ? 'Phone' : 'Small'}</th>`).join('');
    const getAround = mode === 'small'
      ? `<ul><li>Tap a <b>floor</b>, then a <b>room</b>, to see its devices.</li><li>Tap a device to switch it on or off. Tap the <b>›</b> button on a light for brightness and colour.</li><li>Tap a heater or camera to open its controls.</li><li>The <b>‹</b> button at the top goes back one step.</li></ul>`
      : `<ul><li>Tap a <b>room</b> to see everything in it and switch things on or off.</li><li>Tap <b>Controls</b> for heating dials, or brightness and colour on lights. Tap <b>View</b> to see a camera.</li><li>The <b>floor buttons</b> ${mode === 'phone' ? 'along the bottom' : 'on the right'} show one floor bigger. The house button shows everything.</li></ul>`;
    const rail = mode === 'small' ? '' : `<div class="hsec"><h3>Device buttons</h3><ul>
        <li>The buttons ${mode === 'phone' ? 'along the top' : 'on the left'} (Lights, Heat and so on) list every device of that type, floor by floor.</li>
        <li>The number on a button shows how many are on right now.</li>
        <li>Tap more than one to see them together. <b>All off</b> switches off everything in the list.</li></ul></div>`;
    const star = mode === 'phone' ? '' : `<div class="hsec"><h3>This screen's room</h3><ul>
        <li>Open a room and tap the <b>star</b>. This screen now opens on that room.</li>
        <li>${this._returnMins() ? `If nobody touches the screen for ${esc(this._returnMins())} minutes, it goes back to that room by itself.` : 'You can make the screen go back to that room by itself in Settings.'}</li>
        <li>Tap the star again to stop. Each screen remembers its own room.</li></ul></div>`;
    const draw = mode === 'full' ? `<div class="hsec"><h3>Drawing your rooms</h3><ul>
        <li>${admin ? 'Tap a floor button, then <b>Edit layout</b>.' : 'An admin can do this: tap a floor button, then <b>Edit layout</b>.'}</li>
        <li>Drag a room to move it. Drag its corner to resize it. Rooms that overlap turn red.</li>
        <li><b>Save layout</b> shares the drawing with every screen.</li></ul></div>` : '';
    return `<div class="shade ${this._opening ? 'opening' : ''}" data-act="close-bg"><div class="panel help ${this._opening ? 'opening' : ''}" role="dialog" aria-modal="true" aria-label="How to use Lumen">
      <div class="phead">
        <button class="pill" data-act="settings" aria-label="Back to settings">${svg('back', 'width="16" height="16"')}<span>Settings</span></button>
        <h2>How to use Lumen</h2>
      </div>
      <div class="hsec hnow"><p>This screen is using the <b>${names[mode]}</b> layout. Lumen picks the layout by itself from the screen size, so some things only appear on bigger screens.</p></div>
      <div class="hsec"><h3>Getting around</h3>${getAround}</div>
      ${rail}${star}${draw}
      <div class="hsec"><h3>What works where</h3><table>
        <thead><tr><th></th>${head}</tr></thead>
        <tbody>
          ${row('Switch things on and off', 1, 1, 1)}
          ${row('Heating, light and camera controls', 1, 1, 1)}
          ${row('Whole house at a glance', 1, 1, 0)}
          ${row('Device buttons and lists', 1, 1, 0)}
          ${row('This screen’s room (star)', 1, 0, 1)}
          ${row('Drawing rooms', 1, 0, 0)}
        </tbody></table></div>
      <div class="hsec"><h3>The sky</h3><p>The background follows the real sun and your weather: dawn to night, rain, snow, fog, wind and the seasons.</p></div>
    </div></div>`;
  }

  _starBtn(room, small) {
    if (this._modeNow === 'phone') return '';
    const on = this._fav() === room.id;
    const label = on ? 'This screen opens on ' + room.name + '. Tap to stop.' : 'Make ' + room.name + ' this screen’s room';
    if (small) return `<button class="smbtn ${on ? 'on' : ''}" data-act="fav" data-id="${esc(room.id)}" aria-pressed="${on}" aria-label="${esc(label)}">${svg('star')}</button>`;
    return `<button class="pill star ${on ? 'on' : ''}" data-act="fav" data-id="${esc(room.id)}" aria-pressed="${on}" aria-label="${esc(label)}">${svg('star')}<span>${on ? 'This screen’s room' : 'Make this screen’s room'}</span></button>`;
  }

  // the other parts of the same device (a camera's pan buttons, privacy switch, motion sensor)
  // "Front room camera Privacy" shown inside the camera's own panel is just "Privacy"
  _shortName(e, parent) {
    const n = this._name(e), p = this._name(parent);
    return n.toLowerCase().startsWith(p.toLowerCase() + ' ') && n.length > p.length + 2 ? n.charAt(p.length + 1).toUpperCase() + n.slice(p.length + 2) : n;
  }

  _deviceEntities(id) {
    const reg = this._hass.entities || {};
    const dv = reg[id] && reg[id].device_id;
    if (!dv) return [];
    return Object.keys(reg).filter((e) => e !== id && reg[e].device_id === dv && !reg[e].hidden && this._hass.states[e]);
  }

  _cameraHtml(room, id) {
    const s = this._hass.states[id];
    const reg = this._hass.entities || {};
    const parts = this._deviceEntities(id);
    const words = (e) => ' ' + (this._name(e) + ' ' + e.split('.')[1]).toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
    // buttons the camera offers: pan/tilt arrows and zoom, found by name so any brand works
    const btn = {};
    parts.filter((e) => e.startsWith('button.')).forEach((e) => {
      const w = words(e);
      if (/ zoom ?in /.test(w)) btn.zin = e;
      else if (/ zoom ?out /.test(w)) btn.zout = e;
      else ['up', 'down', 'left', 'right'].forEach((d) => { if (w.includes(' ' + d + ' ') && !btn[d]) btn[d] = e; });
    });
    const privacy = parts.find((e) => e.startsWith('switch.') && / privacy /.test(words(e)));
    const switches = parts.filter((e) => e.startsWith('switch.') && (e === privacy || !(reg[e] && reg[e].entity_category)));
    switches.sort((a, b) => (a === privacy ? -1 : b === privacy ? 1 : 0));
    const sensors = parts.filter((e) => e.startsWith('binary_sensor.'));
    const privOn = privacy && this._hass.states[privacy].state === 'on';
    const off = ['unavailable', 'off'].includes(s.state);
    const arrow = (d) => btn[d] ? `<button class="ibtn" data-act="press" data-id="${esc(btn[d])}" aria-label="Turn camera ${d}">${svg(d)}</button>` : '<span></span>';
    const hasPad = btn.up || btn.down || btn.left || btn.right;
    const note = off ? 'The camera is offline.' : privOn ? 'Privacy is on, so the camera isn’t watching.' : '';
    return `<div class="shade ${this._opening ? 'opening' : ''}" data-act="close-bg"><div class="panel ${this._opening ? 'opening' : ''}" role="dialog" aria-modal="true" aria-label="${esc(this._name(id))}">
      <div class="phead">
        <button class="pill" data-act="back" aria-label="Back to ${esc(room.name)}">${svg('back', 'width="16" height="16"')}<span>${esc(room.name)}</span></button>
        <div style="display:flex;flex-direction:column;gap:2px"><h2>${esc(this._name(id))}</h2><span class="sub">${esc(sensors.map((e) => this._shortName(e, id) + ': ' + (this._hass.states[e].state === 'on' ? 'yes' : 'no')).join(' · ') || this._stateText(id))}</span></div>
      </div>
      <div class="camwrap">
        <div class="camslot" data-cam="${esc(id)}">${note ? `<div class="camnote">${svg('camera')}<span>${esc(note)}</span></div>` : ''}</div>
        ${hasPad || btn.zin || btn.zout || switches.length ? `<div style="display:flex;flex-direction:column;gap:18px">
          ${hasPad ? `<div class="ctl"><span class="ctlbl">Point the camera</span><div class="dpad">
            <span></span>${arrow('up')}<span></span>${arrow('left')}<span class="mid"></span>${arrow('right')}<span></span>${arrow('down')}<span></span>
          </div></div>` : ''}
          ${btn.zin || btn.zout ? `<div class="ctl"><span class="ctlbl">Zoom</span><div class="opts">
            ${btn.zout ? `<button class="pill" data-act="press" data-id="${esc(btn.zout)}">${svg('minus', 'width="16" height="16"')}Out</button>` : ''}
            ${btn.zin ? `<button class="pill" data-act="press" data-id="${esc(btn.zin)}">${svg('plus', 'width="16" height="16"')}In</button>` : ''}
          </div></div>` : ''}
          ${switches.length ? `<div class="ctl"><span class="ctlbl">Settings</span><div class="opts">
            ${switches.map((e) => { const on = this._hass.states[e].state === 'on'; return `<button class="pill ${on ? 'warm' : ''}" data-act="toggle" data-id="${esc(e)}" aria-pressed="${on}">${esc(this._shortName(e, id))}: ${on ? 'On' : 'Off'}</button>`; }).join('')}
          </div></div>` : ''}
        </div>` : ''}
      </div>
    </div></div>`;
  }

  _camUrl(id, stream) {
    const s = this._hass.states[id];
    if (!s) return '';
    const tok = s.attributes.access_token;
    if (stream && tok) return '/api/camera_proxy_stream/' + id + '?token=' + encodeURIComponent(tok);
    const pic = s.attributes.entity_picture || ('/api/camera_proxy/' + id + (tok ? '?token=' + encodeURIComponent(tok) : ''));
    return pic + (pic.includes('?') ? '&' : '?') + '_=' + Date.now();
  }

  // The picture lives outside the redraws: the same <img> is moved into each new panel,
  // so the live stream doesn't restart every time something else in the house changes.
  _attachCamera() {
    const slot = this.shadowRoot.querySelector('.camslot');
    if (!slot) { this._stopCamera(); return; }
    const id = slot.dataset.cam;
    if (!this._cam || this._cam.id !== id) {
      this._stopCamera();
      const img = document.createElement('img');
      img.className = 'camimg';
      img.alt = 'Live picture from ' + this._name(id);
      const cam = { id, img, still: false };
      img.onerror = () => {
        if (this._cam !== cam) return;
        if (!cam.still) {
          // no live stream: show a fresh still picture every few seconds instead
          cam.still = true;
          cam.timer = setInterval(() => { if (this._cam === cam) img.src = this._camUrl(id, false); }, 3000);
        }
      };
      img.src = this._camUrl(id, true);
      this._cam = cam;
    }
    slot.insertBefore(this._cam.img, slot.firstChild);
  }

  _stopCamera() {
    if (!this._cam) return;
    clearInterval(this._cam.timer);
    this._cam.img.onerror = null;
    this._cam.img.removeAttribute('src');
    this._cam = null;
  }

  _lightCaps(s) {
    const modes = s.attributes.supported_color_modes || [];
    const colour = modes.some((m) => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(m));
    const temp = modes.includes('color_temp');
    const dim = colour || temp || modes.includes('brightness') || modes.includes('white');
    return { dim, temp, colour };
  }

  _lightHtml(room, id) {
    const s = this._hass.states[id];
    const a = s.attributes;
    const on = s.state === 'on';
    const caps = this._lightCaps(s);
    const bri = on && a.brightness != null ? Math.max(1, Math.round(a.brightness / 2.55)) : 0;
    const kMin = num(a.min_color_temp_kelvin) || 2000, kMax = num(a.max_color_temp_kelvin) || 6500;
    const k = num(a.color_temp_kelvin) || Math.round((kMin + kMax) / 2);
    const tonePct = Math.round((k - kMin) / Math.max(1, kMax - kMin) * 100);
    const toneName = tonePct < 34 ? 'Warm white' : tonePct < 67 ? 'Neutral white' : 'Cool white';
    let rgb = [255, 196, 120];
    if (Array.isArray(a.rgb_color) && a.color_mode && a.color_mode !== 'color_temp') rgb = a.rgb_color;
    else if (caps.temp) { const t = tonePct / 100; rgb = t < 0.5 ? [255, Math.round(181 + (244 - 181) * t * 2), Math.round(107 + (224 - 107) * t * 2)] : [Math.round(255 - (255 - 207) * (t - 0.5) * 2), Math.round(244 - (244 - 230) * (t - 0.5) * 2), Math.round(224 + (255 - 224) * (t - 0.5) * 2)]; }
    const alpha = on ? (0.3 + 0.7 * (caps.dim ? bri / 100 : 1)).toFixed(2) : 0;
    const glow = on ? `radial-gradient(circle,rgba(${rgb.join(',')},${alpha}) 0%,rgba(${rgb.join(',')},${(alpha * 0.45).toFixed(2)}) 45%,rgba(${rgb.join(',')},0) 72%)` : 'radial-gradient(circle,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0) 70%)';
    const SW = [['Red', 0, 85], ['Orange', 30, 85], ['Yellow', 52, 75], ['Green', 130, 70], ['Blue', 220, 80], ['Purple', 275, 70]];
    const hsNow = Array.isArray(a.hs_color) && a.color_mode !== 'color_temp' ? a.hs_color : null;
    return `<div class="shade ${this._opening ? 'opening' : ''}" data-act="close-bg"><div class="panel ${this._opening ? 'opening' : ''}" role="dialog" aria-modal="true" aria-label="${esc(this._name(id))}">
      <div class="phead">
        <button class="pill" data-act="back" aria-label="Back to ${esc(room.name)}">${svg('back', 'width="16" height="16"')}<span>${esc(room.name)}</span></button>
        <div style="display:flex;flex-direction:column;gap:2px"><h2>${esc(this._name(id))}</h2><span class="sub">${esc(this._stateText(id))}</span></div>
      </div>
      <div class="lightgrid">
        <div class="glowbox"><div class="glowball" style="background:${glow}">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="${on ? `rgba(${rgb.join(',')},0.9)` : 'none'}" stroke="#f4f1ff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"></path><path d="M9 18h6" fill="none"></path><path d="M10 21h4" fill="none"></path></svg>
        </div></div>
        <div style="display:flex;flex-direction:column;gap:20px">
          <div class="ctl"><span class="ctlbl">Power</span>
            <button class="pill ${on ? 'warm' : ''}" style="align-self:flex-start" data-act="toggle" data-id="${esc(id)}" aria-pressed="${on}">${on ? 'On' : 'Off'}</button></div>
          ${caps.dim ? `<div class="ctl"><label class="ctlbl ctlrow" for="lumen-bri">Brightness<span class="ctlval">${on ? bri + '%' : 'Off'}</span></label>
            <input id="lumen-bri" class="slider" type="range" min="1" max="100" value="${bri || 50}" data-act="bri" data-id="${esc(id)}" style="background:linear-gradient(to right,#3a3550,#ffc47a)"></div>` : ''}
          ${caps.temp ? `<div class="ctl"><label class="ctlbl ctlrow" for="lumen-tone">White tone<span class="ctlval">${esc(toneName)}</span></label>
            <input id="lumen-tone" class="slider" type="range" min="${kMin}" max="${kMax}" step="50" value="${k}" data-act="kelvin" data-id="${esc(id)}" style="background:linear-gradient(to right,#ffb56b,#fff4e0,#cfe6ff)"></div>` : ''}
          ${caps.colour ? `<div class="ctl"><span class="ctlbl">Colour</span><div class="opts">
            ${SW.map(([n, hh, ss]) => { const sel = hsNow && Math.abs(hsNow[0] - hh) < 12 && Math.abs(hsNow[1] - ss) < 20; return `<button class="sw ${sel ? 'on' : ''}" style="background:hsl(${hh},${ss}%,58%)" data-act="hs" data-id="${esc(id)}" data-h="${hh}" data-s="${ss}" aria-label="${n}" aria-pressed="${!!sel}"></button>`; }).join('')}
          </div></div>` : ''}
          ${!caps.dim ? '<span class="note">This light only switches on and off.</span>' : ''}
        </div>
      </div>
    </div></div>`;
  }

  _climateHtml(room, id) {
    const s = this._hass.states[id];
    const a = s.attributes;
    const min = num(a.min_temp) ?? 5, max = num(a.max_temp) ?? 30;
    const target = num(this._pending[id] ?? a.temperature) ?? min;
    const cur = num(a.current_temperature);
    const off = s.state === 'off';
    const pct = Math.max(0, Math.min(1, (target - min) / (max - min)));
    const modes = (a.hvac_modes || []).filter((m) => ['heat', 'off', 'cool', 'auto', 'heat_cool', 'dry', 'fan_only'].includes(m));
    const MODE = { heat: 'Heat', off: 'Off', cool: 'Cool', auto: 'Auto', heat_cool: 'Heat/cool', dry: 'Dry', fan_only: 'Fan only' };
    const unknownMode = ['unknown', 'unavailable'].includes(s.state);
    return `<div class="shade ${this._opening ? 'opening' : ''}" data-act="close-bg"><div class="panel ${this._opening ? 'opening' : ''}" role="dialog" aria-modal="true" aria-label="${esc(this._name(id))}">
      <div class="phead">
        <button class="pill" data-act="back" aria-label="Back to ${esc(room.name)}">${svg('back', 'width="16" height="16"')}<span>${esc(room.name)}</span></button>
        <div style="display:flex;flex-direction:column;gap:2px"><h2>${esc(this._name(id))}</h2><span class="sub">${esc(this._stateText(id))}</span></div>
      </div>
      <div class="climate">
        <div class="dialbox">
          <svg width="230" height="230" viewBox="0 0 240 240" role="img" aria-label="Target ${esc(fmtT(target))}${cur != null ? ', room ' + esc(fmtT(cur)) : ''}">
            <circle cx="120" cy="120" r="96" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="75 100" transform="rotate(135 120 120)"></circle>
            <circle cx="120" cy="120" r="96" fill="none" stroke="#ff8a50" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="${off ? 0 : (75 * pct).toFixed(1)} 100" transform="rotate(135 120 120)"></circle>
            <text x="120" y="124" text-anchor="middle" font-family="Space Grotesk, Inter, sans-serif" font-size="46" font-weight="600" fill="#f4f1ff">${off ? 'Off' : esc(fmtT(target))}</text>
            <text x="120" y="158" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" fill="#cfcae6">${cur != null ? 'Room is ' + esc(fmtT(cur)) : ''}</text>
          </svg>
        </div>
        <div style="display:flex;flex-direction:column;gap:22px">
          <div class="ctl">
            <span class="ctlbl">Target temperature</span>
            <div style="display:flex;align-items:center;gap:18px">
              <button class="step" data-act="temp" data-id="${esc(id)}" data-delta="-0.5" aria-label="Lower target temperature">−</button>
              <span style="font-family:var(--lumen-head);font-size:34px;font-weight:600;min-width:110px;text-align:center">${esc(fmtT(target))}</span>
              <button class="step" data-act="temp" data-id="${esc(id)}" data-delta="0.5" aria-label="Raise target temperature">+</button>
            </div>
          </div>
          ${modes.length ? `<div class="ctl"><span class="ctlbl">Mode</span><div class="opts">${modes.map((m) => `<button class="pill ${s.state === m ? 'on' : ''}" data-act="mode" data-id="${esc(id)}" data-mode="${esc(m)}" aria-pressed="${s.state === m}">${esc(MODE[m] || m)}</button>`).join('')}</div>
            ${unknownMode ? '<span class="note">The radiator hasn’t reported its mode yet. Picking one sets it.</span>' : ''}</div>` : ''}
        </div>
      </div>
    </div></div>`;
  }

  /* ---------- actions ---------- */

  _onClick(ev) {
    const t = ev.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act;
    const id = t.dataset.id;
    if (act === 'close-bg' && this._view.help) { if (ev.target !== t) return; this._view.help = false; }
    else if (act === 'close-bg') { if (ev.target !== t) return; if (this._modeNow !== 'small') this._view.room = null; this._view.entity = null; }
    else if (act === 'floor') { this._view = { floor: id || null, room: null, entity: null, kinds: this._view.kinds || [] }; this._edit = null; }
    else if (act === 'kind') { const k = this._view.kinds || []; this._view.kinds = k.includes(id) ? k.filter((x) => x !== id) : k.concat(id); this._view.room = null; this._edit = null; }
    else if (act === 'kinds-done') { this._view.kinds = []; }
    else if (act === 'clear') { this._view = { floor: null, room: null, entity: null, kinds: [] }; this._edit = null; }
    else if (act === 'open-entity') { this._view.room = t.dataset.room; this._view.entity = id; }
    else if (act === 'alloff') {
      const ids = [];
      this._model().forEach((f) => { if (this._view.floor && f.id !== this._view.floor) return; f.rooms.forEach((r) => r.devs.forEach((x) => { if (this._kindOf(x) === id && this._hass.states[x].state === 'on') ids.push(x); })); });
      if (ids.length) this._hass.callService('homeassistant', 'turn_off', { entity_id: ids });
      return;
    }
    else if (act === 'edit-start') { this._startEdit(this._view.floor); }
    else if (act === 'edit-cancel') { this._edit = null; }
    else if (act === 'edit-auto') {
      const floor = this._model().find((f) => f.id === this._edit.floor);
      const auto = this._layout(floor.rooms.length);
      floor.rooms.forEach((r, k) => { const c = auto[k]; this._edit.draft[r.id] = [c.x, c.y, c.w, c.h].map((n) => Math.round(n * 10) / 10); });
    }
    else if (act === 'edit-save') { this._saveLayout(); return; }
    else if (act === 'hs') { this._hass.callService('light', 'turn_on', { entity_id: id, hs_color: [parseFloat(t.dataset.h), parseFloat(t.dataset.s)] }); return; }
    else if (act === 'room') { this._view.room = id; this._view.entity = null; }
    else if (act === 'close') { this._view.room = null; this._view.entity = null; }
    else if (act === 'back') { this._view.entity = null; }
    else if (act === 'entity') { this._view.entity = id; }
    else if (act === 'settings') { this._view.help = 'settings'; }
    else if (act === 'help') { this._view.help = 'howto'; }
    else if (act === 'help-close') { this._view.help = false; }
    else if (act === 'set') { this._setScreen(t.dataset.key, t.dataset.val); }
    else if (act === 'press') { this._hass.callService('button', 'press', { entity_id: id }); return; }
    else if (act === 'fav') { this._setFav(this._fav() === id ? '' : id); }
    else if (act === 'sm-up') {
      const v = this._view;
      if (v.room) { let fl = null; this._model().forEach((f) => { if (f.rooms.some((r) => r.id === v.room)) fl = f.id; }); this._view = { floor: fl, room: null, entity: null, kinds: [] }; }
      else this._view = { floor: null, room: null, entity: null, kinds: [] };
    }
    else if (act === 'toggle') { this._hass.callService('homeassistant', 'toggle', { entity_id: id }); return; }
    else if (act === 'mode') { this._hass.callService('climate', 'set_hvac_mode', { entity_id: id, hvac_mode: t.dataset.mode }); return; }
    else if (act === 'temp') { this._nudge(id, parseFloat(t.dataset.delta)); }
    this._sig = '';
    this._render();
  }

  _nudge(id, delta) {
    const s = this._hass.states[id];
    if (!s) return;
    const a = s.attributes;
    const min = num(a.min_temp) ?? 5, max = num(a.max_temp) ?? 30;
    const stepSize = num(a.target_temp_step) || 0.5;
    const base = num(this._pending[id] ?? a.temperature) ?? min;
    const next = Math.max(min, Math.min(max, Math.round((base + Math.sign(delta) * stepSize) / stepSize) * stepSize));
    this._pending[id] = next;
    // one send timer per radiator; each send carries the number it was made with
    this._sendTimers = this._sendTimers || {};
    clearTimeout(this._sendTimers[id]);
    this._sendTimers[id] = setTimeout(() => {
      const value = next;
      if (!Number.isFinite(value)) return;
      Promise.resolve(this._hass.callService('climate', 'set_temperature', { entity_id: id, temperature: value }))
        .catch(() => {})
        .finally(() => {
          // let Home Assistant catch up, then drop our local number, unless a newer tap replaced it
          setTimeout(() => { if (this._pending[id] === value) { delete this._pending[id]; this._sig = ''; this._render(); } }, 4000);
        });
    }, 700);
  }
}

if (!customElements.get('lumen-card')) {
  customElements.define('lumen-card', LumenCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'lumen-card', name: 'Lumen', description: 'A living-sky whole-house view: stacked floors, glowing rooms and radiator control.' });
  console.info(`%c LUMEN %c ${LUMEN_VERSION} `, 'background:#ffc47a;color:#2a1a08;font-weight:700', 'background:#16183c;color:#f4f1ff');
}

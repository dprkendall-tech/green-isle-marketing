// Illustrative, installer-configurable values. No supplier or tariff feed.
export const CONFIG = Object.freeze({panelWatts:450,importRate:0.27,exportRate:0.10,standingDaily:0.55,yieldPerKwp:900,prices:{8:5495,10:5995,12:6495,16:7495},batteries:{0:0,5:2450,10:3950},batteryEfficiency:0.9,annualCycles:220});
const clamp=(value,min,max,fallback)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
export function estimate(input={}) {
  const panels=[8,10,12,16].includes(Number(input.panels))?Number(input.panels):10;
  const battery=[0,5,10].includes(Number(input.battery))?Number(input.battery):5;
  const bill=clamp(input.bill,40,400,140);
  const importRate=clamp(input.importRate,10,60,27)/100;
  const exportRate=clamp(input.exportRate,0,30,10)/100;
  const yieldPerKwp=clamp(input.yieldPerKwp,650,1100,900);
  const orientation=['south','eastwest','unsure'].includes(input.orientation)?input.orientation:'south';
  const factor=orientation==='eastwest'?0.85:orientation==='unsure'?0.9:1;
  const occupancy=['out','mixed','home'].includes(input.occupancy)?input.occupancy:'mixed';
  const kwp=panels*CONFIG.panelWatts/1000;
  const annualDemand=Math.max(0,(bill*12-CONFIG.standingDaily*365)/importRate);
  const roofGeneration=Number(input.roofGeneration);
  const usesRoofData=input.roofGeneration!=null&&Number.isFinite(roofGeneration)&&roofGeneration>0&&roofGeneration<50000;
  const generation=usesRoofData?roofGeneration:kwp*yieldPerKwp*factor;
  const direct=Math.min(generation*({out:0.28,mixed:0.38,home:0.48}[occupancy]),annualDemand*0.65);
  const charge=Math.max(0,Math.min(generation-direct,battery*CONFIG.annualCycles,(annualDemand*0.82-direct)/CONFIG.batteryEfficiency));
  const stored=charge*CONFIG.batteryEfficiency;
  const selfUsed=direct+stored;
  const exported=Math.max(0,generation-direct-charge);
  const losses=charge-stored;
  const billSaving=selfUsed*importRate;
  const exportIncome=exported*exportRate;
  const benefit=billSaving+exportIncome;
  const cost=CONFIG.prices[panels]+CONFIG.batteries[battery];
  return {panels,battery,bill,kwp,annualDemand,generation,direct,stored,selfUsed,exported,losses,billSaving,exportIncome,benefit,costLow:Math.round(cost/50)*50,costHigh:Math.ceil(cost*1.15/50)*50,monthlyAfter:Math.max(CONFIG.standingDaily*365/12,bill-billSaving/12),selfUsePercent:Math.round(selfUsed/generation*100),importRate,exportRate,yieldPerKwp,orientation,occupancy,usesRoofData};
}

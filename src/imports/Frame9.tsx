import svgPaths from "./svg-mv3d228dce";

function ShieldCheck() {
  return (
    <div className="relative shrink-0 size-[56px]" data-name="ShieldCheck">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
        <g id="ShieldCheck">
          <path d={svgPaths.p3cb22a00} fill="var(--fill-0, #070808)" id="Vector" />
          <path d={svgPaths.p2f410000} fill="var(--fill-0, #FF5222)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px not-italic relative">
      <p className="font-['Poppins:Medium',sans-serif] leading-[1.3] relative shrink-0 text-[#070808] text-[20px] w-full" style={{ fontFeatureSettings: "'ss04'" }}>
        Safety
      </p>
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] relative shrink-0 text-[#84888c] text-[12px] w-full" style={{ fontFeatureSettings: "'ss04'" }}>
        All markets are powered by blockchain smart contracts, ensuring transparency, fairness, and secure settlement for every prediction.
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dfe0e2] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[20px] items-center px-[16px] py-[36px] relative w-full">
          <ShieldCheck />
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="relative size-full">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50.75 36.75">
        <g id="Group 1960813039">
          <path d={svgPaths.p37ff1c80} fill="var(--fill-0, #070808)" id="Vector" />
          <g id="Vector_2">
            <path d={svgPaths.p37669b00} fill="var(--fill-0, #FF5222)" />
            <path d={svgPaths.p3e421d80} fill="var(--fill-0, #FF5222)" />
            <path d={svgPaths.pc39f400} fill="var(--fill-0, #FF5222)" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Coin() {
  return (
    <div className="overflow-clip relative shrink-0 size-[56px]" data-name="Coin">
      <div className="absolute flex inset-[-5.24%] items-center justify-center">
        <div className="-rotate-45 flex-none h-[36.75px] w-[50.75px]">
          <Group />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px not-italic relative">
      <p className="font-['Poppins:Medium',sans-serif] leading-[1.3] relative shrink-0 text-[#070808] text-[20px] w-full" style={{ fontFeatureSettings: "'ss04'" }}>
        Earning
      </p>
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] relative shrink-0 text-[#84888c] text-[12px] w-full" style={{ fontFeatureSettings: "'ss04'" }}>
        Earn through in multiple ways accurate predictions, market trading, and creator revenue sharing, etc.
      </p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative rounded-[12px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#dfe0e2] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[20px] items-center px-[16px] py-[36px] relative w-full">
          <Coin />
          <Frame4 />
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start justify-center min-h-px min-w-px relative self-stretch">
      <Frame1 />
      <Frame3 />
    </div>
  );
}

function GlobeSimple() {
  return (
    <div className="relative shrink-0 size-[56px]" data-name="GlobeSimple">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
        <g id="GlobeSimple">
          <path d={svgPaths.pea3e80} fill="var(--fill-0, #070808)" id="Vector" />
          <path d={svgPaths.p36cd0500} fill="var(--fill-0, #070808)" id="Vector_2" />
          <path d={svgPaths.p2776ab00} fill="var(--fill-0, #FF5222)" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col items-start not-italic relative shrink-0 w-full">
      <p className="font-['Poppins:Medium',sans-serif] leading-[1.3] relative shrink-0 text-[#070808] text-[20px] w-full" style={{ fontFeatureSettings: "'ss04'" }}>
        Diversity
      </p>
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] relative shrink-0 text-[#84888c] text-[12px] w-full" style={{ fontFeatureSettings: "'ss04'" }}>
        upport event prediction markets and price prediction markets, covering a wide range of sectors including crypto, politics, sports, finance, and entertainment.
      </p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#f5f6f7] content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[4px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#84888c] text-[12px] text-center whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>{`Binary & Multiple-outcome`}</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#f5f6f7] content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[4px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#84888c] text-[12px] text-center whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>{`Orderbook & AMM`}</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#f5f6f7] content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[4px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#84888c] text-[12px] text-center whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
        Pari-Mutual
      </p>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#f5f6f7] content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[4px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#84888c] text-[12px] text-center whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
        Vote for Your Voice
      </p>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#f5f6f7] content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[4px] relative rounded-[4px] shrink-0" data-name="Button">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#84888c] text-[12px] text-center whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
        Mutilple currenies supported
      </p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-h-px min-w-px relative">
      <Frame9 />
      <Frame10 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative rounded-[12px] self-stretch">
      <div aria-hidden="true" className="absolute border border-[#dfe0e2] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[20px] items-center p-[16px] relative size-full">
          <GlobeSimple />
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[12px] h-[280px] items-start relative shrink-0 w-full">
      <Frame8 />
      <Frame5 />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center relative size-full">
      <p className="font-['Poppins:SemiBold',sans-serif] leading-[1.3] not-italic relative shrink-0 text-[#070808] text-[40px] text-center whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
        Why choose us?
      </p>
      <Frame7 />
    </div>
  );
}
import svgPaths from "./svg-ifepausbbc";
import imgImage35 from "figma:asset/91f5683a4a971b3a8efc07a06ca0bdbf19d18872.png";

function SignalWifiBattery() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Signal, Wifi, Battery">
      <div className="h-[12px] relative shrink-0 w-[18px]" data-name="Icon / Mobile Signal">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 12">
          <g id="Icon / Mobile Signal">
            <path d={svgPaths.p1ec31400} fill="var(--fill-0, #090A0D)" />
            <path d={svgPaths.p19f8d480} fill="var(--fill-0, #090A0D)" />
            <path d={svgPaths.p13f4aa00} fill="var(--fill-0, #090A0D)" />
            <path d={svgPaths.p1bfb7500} fill="var(--fill-0, #090A0D)" />
          </g>
        </svg>
      </div>
      <div className="h-[11.834px] relative shrink-0 w-[17px]" data-name="Wifi">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 11.8338">
          <path d={svgPaths.p17a4bf30} fill="var(--fill-0, #090A0D)" id="Wifi" />
        </svg>
      </div>
      <div className="h-[13px] relative shrink-0 w-[27.401px]" data-name="_StatusBar-battery">
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13px] left-[calc(50%-1.2px)] top-1/2 w-[25px]" data-name="Outline">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 13">
            <path d={svgPaths.p3f827980} id="Outline" opacity="0.35" stroke="var(--stroke-0, #090A0D)" />
          </svg>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[4.22px] left-[calc(50%+13px)] top-[calc(50%+0.61px)] w-[1.401px]" data-name="Battery End">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.40119 4.22034">
            <path d={svgPaths.p237cb000} fill="var(--fill-0, #090A0D)" id="Battery End" opacity="0.4" />
          </svg>
        </div>
        <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[9px] left-[calc(50%-1.2px)] top-1/2 w-[21px]" data-name="Fill">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 9">
            <path d={svgPaths.pa544c00} fill="var(--fill-0, #090A0D)" id="Fill" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function RightSide() {
  return (
    <div className="content-stretch flex h-full items-center justify-center relative shrink-0" data-name="Right Side">
      <SignalWifiBattery />
    </div>
  );
}

function Left() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="left">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="CaretLeft">
        <div className="absolute inset-[14.06%_32.81%_14.05%_26.55%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.12893 14.3783">
            <path d={svgPaths.p20471900} fill="var(--fill-0, #070808)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Right() {
  return (
    <div className="content-stretch flex gap-[16px] items-center opacity-0 relative shrink-0" data-name="right">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="ShareFat">
        <div className="absolute inset-[9.37%_6.25%_18.74%_6.25%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5004 14.3777">
            <path d={svgPaths.p16c8be90} fill="var(--fill-0, #070808)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="h-[44px] relative shrink-0 w-[375px]">
      <div className="absolute bg-white content-stretch flex h-[44px] items-center justify-between left-0 px-[16px] py-[10px] top-0 w-[375px]" data-name="Regular navigation">
        <Left />
        <Right />
        <p className="-translate-x-1/2 absolute font-['Poppins:Medium',sans-serif] leading-[1.3] left-[calc(50%-0.5px)] not-italic text-[#070808] text-[18px] text-center top-[calc(50%-11px)] whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
          Deposit USDT
        </p>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="backdrop-blur-[0px] bg-[rgba(255,255,255,0.01)] content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="backdrop-blur-[10px] h-[44px] relative shrink-0 w-full" data-name=".Top Navigation/Status Bar">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[16px] relative size-full">
            <p className="font-['HarmonyOS_Sans_SC:Bold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#090a0d] text-[15px] text-center w-[44px]">12:41</p>
            <RightSide />
          </div>
        </div>
      </div>
      <Frame9 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#070808] text-[14px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
        Label
      </p>
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative" data-name="text">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#84888c] text-[14px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
        Select network
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center p-[2px] relative shrink-0">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="CaretDown">
        <div className="absolute inset-[32.8%_14.05%_26.55%_14.05%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.5039 6.50377">
            <path d={svgPaths.p12bd8c80} fill="var(--fill-0, #070808)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#fafafa] h-[48px] relative rounded-[8px] shrink-0 w-full" data-name="input">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[16px] relative size-full">
          <Text />
          <Frame />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center p-[16px] relative shrink-0 w-[375px]">
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-center justify-center min-h-px min-w-px relative rounded-[8px]" data-name="select">
        <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="lable">
          <Frame2 />
        </div>
        <Input />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-center p-[16px] relative shrink-0 w-[375px]">
      <div className="relative shrink-0 size-[160px]" data-name="image 35">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage35} />
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-0.5px)] overflow-clip size-[28px] top-1/2" data-name="Component 1">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
          <g id="Group">
            <path d={svgPaths.pc390800} fill="var(--fill-0, #26A17B)" id="Vector" />
            <path clipRule="evenodd" d={svgPaths.p2ee4c900} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector_2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0">
      <p className="font-['Poppins:Regular',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#84888c] text-[12px] whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
        Deposit address
      </p>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Poppins:Medium',sans-serif] leading-[1.5] min-h-px min-w-px not-italic relative text-[#070808] text-[14px]" style={{ fontFeatureSettings: "'ss04'" }}>
        7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV
      </p>
      <div className="bg-[#070808] content-stretch flex gap-[8px] h-[28px] items-center justify-center overflow-clip px-[12px] relative rounded-[4px] shrink-0" data-name="Button">
        <p className="font-['Poppins:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[12px] text-center text-white whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
          Copy
        </p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-h-px min-w-px relative">
      <Frame7 />
      <Frame10 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <Frame3 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex items-start justify-between leading-[1.5] not-italic relative shrink-0 text-[12px] w-full whitespace-nowrap">
      <p className="font-['Poppins:Regular',sans-serif] relative shrink-0 text-[#84888c]" style={{ fontFeatureSettings: "'ss04'" }}>
        Deposit confirmation
      </p>
      <p className="font-['Poppins:Medium',sans-serif] relative shrink-0 text-[#070808]" style={{ fontFeatureSettings: "'ss04'" }}>
        3min
      </p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center px-[16px] py-[12px] relative shrink-0 w-[375px]">
      <Frame11 />
      <Frame8 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex flex-col items-start p-[16px] relative w-full">
        <div className="bg-[#070808] h-[48px] relative rounded-[8px] shrink-0 w-full" data-name="Button">
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex gap-[8px] items-center justify-center px-[20px] relative size-full">
              <p className="font-['Poppins:Medium',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[16px] text-center text-white whitespace-nowrap" style={{ fontFeatureSettings: "'ss04'" }}>
                Share
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col items-start left-0 w-[375px]">
      <Frame12 />
      <div className="bg-white h-[33px] relative shrink-0 w-[375px]" data-name="1. Indicator">
        <div className="-translate-x-1/2 absolute bg-[#090a0d] bottom-[8px] h-[5px] left-1/2 rounded-[100px] w-[135px]" data-name="Line" />
      </div>
    </div>
  );
}

export default function Deposit() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="deposit">
      <Frame6 />
      <Frame4 />
      <Frame1 />
      <Frame5 />
      <Frame13 />
    </div>
  );
}
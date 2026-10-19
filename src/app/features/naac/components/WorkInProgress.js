'use client';

export default function WorkInProgress({ title }) {
  return (
    <div className="card-shadow h-full bg-white p-[20px] xl:p-[25px] 3xl:p-[1.563vw]">
      <div className="mb-3">
        <h2 className="m-0 text-[14px] font-[700] text-[#19212A] xl:text-[22px] 3xl:text-[1.146vw]">
          {title}
        </h2>
      </div>
      <div className="flex min-h-[320px] items-center justify-center rounded border border-dashed border-[#E7EDF7] bg-[#FAFBFC] text-[#6C768B]">
        Work in progress
      </div>
    </div>
  );
}

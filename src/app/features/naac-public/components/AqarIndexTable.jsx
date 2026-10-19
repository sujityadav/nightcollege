import AqarRowViewLink from './AqarRowViewLink';

export default function AqarIndexTable({ groups, loading }) {
  return (
    <div className="overflow-x-auto border border-[#333]">
      <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[#92d050]">
            <th className="w-[72px] border border-[#333] px-2 py-2 font-bold text-[#111]">
              Sr. No.
            </th>
            <th className="border border-[#333] px-3 py-2 font-bold text-[#111]">Details</th>
            <th className="w-[88px] border border-[#333] px-2 py-2 font-bold text-[#111]">
              Link
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="bg-[#f0f4f8]">
              <td colSpan={3} className="border border-[#333] px-3 py-8 text-center text-[#6C768B]">
                Loading...
              </td>
            </tr>
          ) : !groups?.length ? (
            <tr className="bg-[#f0f4f8]">
              <td colSpan={3} className="border border-[#333] px-3 py-8 text-center text-[#6C768B]">
                No index entries published yet.
              </td>
            </tr>
          ) : (
            groups.flatMap((group) => {
              const sectionRow = (
                <tr key={`section-${group.section._id}`} className="bg-[#e8eef5]">
                  <td className="w-[72px] border border-[#333] px-2 py-2" />
                  <td className="border border-[#333] px-3 py-2 font-bold text-[#ff0000]">
                    {group.section.name}
                  </td>
                  <td className="w-[88px] border border-[#333] px-2 py-2" />
                </tr>
              );

              const dataRows = (group.rows || []).map((row) => (
                <tr key={row._id} className="bg-[#f0f4f8]">
                  <td className="w-[72px] border border-[#333] px-2 py-2 align-top whitespace-nowrap text-xs sm:text-sm">
                    {row.srNo}
                  </td>
                  <td className="border border-[#333] px-3 py-2 align-top whitespace-pre-wrap">
                    {row.details}
                  </td>
                  <td className="w-[88px] border border-[#333] px-2 py-2 align-top whitespace-nowrap text-xs sm:text-sm">
                    <AqarRowViewLink row={row} />
                  </td>
                </tr>
              ));

              return [sectionRow, ...dataRows];
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

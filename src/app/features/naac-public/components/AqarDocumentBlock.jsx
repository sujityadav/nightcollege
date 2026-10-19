import AqarIndexTable from './AqarIndexTable';
import 'suneditor/dist/css/suneditor.min.css';

export default function AqarDocumentBlock({ document, parts, loading }) {
  if (!document && !loading) return null;

  return (
    <section className="card-shadow bg-white p-4 sm:p-8 md:p-10">
      <div className="text-center">
        <p className="text-xl font-bold uppercase text-[#111] sm:text-2xl md:text-[26px]">
          Internal Quality Assurance Cell (IQAC)
        </p>
        <h2 className="mt-2 text-xl font-bold uppercase text-[#ff0000] underline decoration-[#ff0000] decoration-2 underline-offset-4 sm:text-2xl md:text-[26px]">
          {document?.title}
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-12">
        {(parts || []).map((block) => (
          <div key={block.part._id}>
            {block.part?.description ? (
              <div
                className="quick-link-content mx-auto max-w-3xl text-center text-sm italic text-[#5b2c6f] sm:text-base"
                dangerouslySetInnerHTML={{ __html: block.part.description }}
              />
            ) : null}
            <h3 className="mt-6 text-center text-lg font-bold uppercase text-[#ff0000] sm:text-xl">
              Index
            </h3>
            <div className="mt-4">
              <AqarIndexTable groups={block.groups} loading={loading} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

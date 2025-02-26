import { QualificationForm } from "../../components/doctorComponents/Qualification";
// import { Breadcrumb } from "../../components/common/doctorCommon/BreadCrumb";

const Qualification = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            {/* <h1 className="text-2xl font-semibold">Qualification</h1> */}
            {/* <Breadcrumb /> */}
          </div>
          <QualificationForm />
        </div>
      </main>
    </div>
  );
};

export default Qualification;

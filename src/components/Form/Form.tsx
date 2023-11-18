import React, { useState, useEffect } from "react";
import FileTags from "./FileTags";
import { MultiSelect } from "react-multi-select-component";
import { api } from "~/utils/api";
import { AnalysisTypeOption, Tag } from "~/utils/types";

export default function Form() {
  const inputStyles =
    "block w-full rounded-md border-0 py-1.5 pl-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-300";

  const [useCaseTitle, setUseCaseTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [useCaseDescription, setUseCaseDescription] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisTypeOption[]>([]);
  const {
    data: analysisTypeOptionsData,
    isLoading: analysisTypeOptionsIsLoading,
  } = api.analysis.getAnalysisTypes.useQuery();

  const analysisTypeOptions: AnalysisTypeOption[] = analysisTypeOptionsIsLoading
    ? []
    : analysisTypeOptionsData?.types?.map(
        (option: { name: string; id: number }) => ({
          label: option.name,
          value: option.id,
        }),
      ) || [];

  const getTags = (): Tag[] => {return tags}

  // Prevent Enter key from submitting the form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const useCaseSubmission = api.useCase.submitUseCase.useMutation();

  // Check that all input fields have some value
  function handleSubmit(e: React.FormEvent) {
    setSubmitAttempted(true);
    if (
      useCaseTitle.trim() === "" ||
      analysisTypes.length === 0 ||
      tags.length === 0 ||
      useCaseDescription.trim() === ""
    ) {
      e.preventDefault();
    } else {
      const analysisTypeIDs: number[] = analysisTypes.map((type) => type.value);
      const validTags: string[] = tags
        .filter((tag) => tag.isValid)
        .map((tag) => tag.name);
      useCaseSubmission.mutate({
        tags: validTags,
        useCaseDescription: useCaseDescription,
        useCaseName: useCaseTitle,
        analysisTypeIds: analysisTypeIDs,
      });
      if (!useCaseSubmission.isSuccess) {
        // TODO : Handle a failed form submission more throughouly.
        //        This is when the user submits valid data, but the mutation still fails.
        //        We likely want to do some form of logging for such an error.
        window.alert(
          "Failed to submit the form. Please try again.\nIf the issue persists, please contact an administrator",
        );
        console.error("Mutation failed", useCaseSubmission.error);
        e.preventDefault();
      }
    }
  }

  return (
    <form className="mx-auto max-w-screen-md p-4 " onSubmit={handleSubmit}>
      <div className="font-nunito mt-10 grid grid-cols-2 gap-x-6 gap-y-4 rounded border border-slate-400 bg-lightBlue p-4 font-medium shadow-md">
        <div>
          <label htmlFor="useCaseTitle">Use Case Title</label>
          <input
            className={`${inputStyles} ${
              submitAttempted && useCaseTitle.trim() === ""
                ? "ring-2 ring-red-500"
                : ""
            }`}
            type="text"
            id="useCaseTitle"
            onKeyDown={handleKeyDown}
            onChange={(e) => setUseCaseTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="analysisType">Analysis Type(s)</label>
          <MultiSelect
            options={analysisTypeOptions}
            value={analysisTypes}
            onChange={setAnalysisTypes}
            labelledBy="AnalysisTypeSelect"
            isLoading={analysisTypeOptionsIsLoading}
            hasSelectAll={false}
            disableSearch={true}
            className={`${"rounded shadow-sm"} ${
              submitAttempted && analysisTypes.length === 0
                ? "ring-2 ring-red-500"
                : ""
            }`}
          />
        </div>
        <div className="col-span-2">
          <FileTags
            getTags={getTags}
            setTags={setTags}
            inputStyles={`${inputStyles} ${
              submitAttempted && tags.length === 0 ? "ring-red-500 ring-2" : ""
            }`}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="useCaseDescription">Use Case Description</label>
          <textarea
            className={`${inputStyles} ${
              submitAttempted && useCaseDescription.trim() === ""
                ? "ring-2 ring-red-500"
                : ""
            }`}
            rows={4}
            id="useCaseDescription"
            onKeyDown={handleKeyDown}
            onChange={(e) => setUseCaseDescription(e.target.value)}
          />
        </div>
        <div className="col-span-2 flex justify-center">
          <button
            className="rounded bg-darkBlue px-4 py-2 text-white shadow-md"
            type="submit"
          >
            Submit Use Case
          </button>
        </div>
      </div>
    </form>
  );
}

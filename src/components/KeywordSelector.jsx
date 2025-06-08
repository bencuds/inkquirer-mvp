import Select from "react-select";

export default function KeywordSelector({ selectedKeywords, setSelectedKeywords, options, styles }) {
  return (
    <>
      <label style={{ fontWeight: "bold", color: "#111" }}>Select Keywords:</label>
      <Select
        isMulti
        options={options}
        value={selectedKeywords}
        onChange={setSelectedKeywords}
        styles={styles}
      />
    </>
  );
}
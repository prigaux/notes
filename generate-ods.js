// NB: it would be easier to generate a "Single OpenDocument XML" http://docs.oasis-open.org/office/v1.2/os/OpenDocument-v1.2-os-part1.html#element-office_document
// alas Microsoft 365 still does not implement it in 2023

import { makeZip } from "https://cdn.jsdelivr.net/npm/client-zip/index.js"

const XML_CHAR_MAP = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }
const escapeXml = (unsafe) => unsafe.replace(/[<>&"]/g, c => XML_CHAR_MAP[c])

async function export_spreadsheet_raw(table_rows) {
    const mimetype = "application/vnd.oasis.opendocument.spreadsheet"

    const entries = [
        { name: "mimetype", input: mimetype },    
        { name: "META-INF/manifest.xml", input :
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="${mimetype}"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>
` },
        { name: "content.xml", input: 
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<office:document-content office:version="1.1"
    xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
    xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
    xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
    xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
    xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
    xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0">
 <office:automatic-styles>
  <style:style style:name="mydate" style:family="table-cell" style:parent-style-name="Default" style:data-style-name="DD_MM_YYYY_"/>
  <style:style style:name="mytitle" style:family="table-cell" style:parent-style-name="Default">
   <style:paragraph-properties fo:text-align="center"/>
   <style:text-properties fo:font-weight="bold"/>
  </style:style>
  <number:date-style style:name="DD_MM_YYYY_" number:automatic-order="true">
   <number:day number:style="long"/> <number:text>/</number:text> 
   <number:month number:style="long"/> <number:text>/</number:text> 
   <number:year number:style="long"/>
  </number:date-style>
 </office:automatic-styles>
 <office:body>
  <office:spreadsheet>
   <table:table>
    <table:table-column /> <!-- needed for schema compliance -->
${table_rows}
   </table:table>
  </office:spreadsheet>
 </office:body>
</office:document-content>` },
    ]

    const blob = await new Response(
        makeZip(entries), 
        { headers: { "Content-Type": mimetype } }
    ).blob()
  
    // make and click a temporary link to download the Blob
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "export.ods"
    link.onload = () => URL.revokeObjectURL(link.href)
    link.click()
    link.remove()
}

async function export_spreadsheet(data) {
    const format_table_cell_header = txt => (
        `      <table:table-cell table:style-name="mytitle"><text:p>${escapeXml(txt)}</text:p></table:table-cell>`
    )
    const format_table_cell = cell => (
      typeof cell === 'number' ?
        `      <table:table-cell office:value-type="float" office:value="${cell}" />` :
      cell instanceof Date ?
        `      <table:table-cell office:value-type="date" office:date-value="${cell.toISOString()}" table:style-name="mydate" />` :
        `      <table:table-cell office:value-type="string" office:string-value="${escapeXml(cell)}" />`
    )
    const format_table_row = one => `
    <table:table-row>
${Object.values(one).map(format_table_cell).join("\n")}
    </table:table-row>
`
    await export_spreadsheet_raw([
        `<table:table-row>${Object.keys(data[0]).map(format_table_cell_header).join("\n")}</table:table-row>`,
        ...data.map(format_table_row),
    ].join(""))
}

export_spreadsheet([
    { foo: `Foo`, bar: 123, day: new Date("2020-01-01") },
    { foo: "Foo2", bar: 3.1415, day: new Date("2020-12-31 23:59:59")  },
])

import React from 'react';

export function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead className={`[&_tr]:border-b ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableFooter({ children, className = "" }) {
  return (
    <tfoot className={`bg-gray-900 font-medium text-gray-50 [&>tr]:last:border-b-0 ${className}`}>
      {children}
    </tfoot>
  );
}

export function TableRow({ children, className = "" }) {
  return (
    <tr className={`border-b transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
      {children}
    </td>
  );
}

export function TableCaption({ children, className = "" }) {
  return (
    <caption className={`mt-4 text-sm text-gray-500 ${className}`}>
      {children}
    </caption>
  );
}
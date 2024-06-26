import React, { useState } from 'react';
import { Bounce, ToastPosition, toast } from 'react-toastify';
import { api } from '~/utils/api';
import type { Source } from '~/utils/types';

interface SourceProps {
  source: Source;
  updateSource: (source: Source, isValid: boolean) => void;
  onRemove: (source: Source) => void;
}

const toastProperties = {
  position: 'bottom-right' as ToastPosition,
  autoClose: 10000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
  transition: Bounce,
};

const Source = ({ source, updateSource, onRemove }: SourceProps) => {
  const [queryExecuted, setQueryExecuted] = useState<boolean>(false);
  const { data: sourceValidationData, isLoading } =
    api.source.validateSource.useQuery(
      { sourceTag: source.name },
      {
        enabled: !queryExecuted,
        onSuccess: (data) => {
          updateSource(source, data.isValid);
          if (!data.isValid) {
            toast.error(data.notificationErrorMessage, {
              ...toastProperties,
            });
            if (data.consoleErrorMessage !== undefined) {
              console.error(data.consoleErrorMessage);
            }
          }
          setQueryExecuted(true);
        },
      }
    );

  const loading = isLoading && !sourceValidationData;

  return (
    <div
      className={`source-tag m-1 flex items-center justify-center rounded-full border ${
        loading
          ? 'border-black bg-veryLightGrey'
          : sourceValidationData?.isValid
            ? 'border-green bg-lightGreen text-green'
            : 'border-red bg-lightRed text-red'
      } px-2 py-1 font-medium`}
    >
      <div className='text-xs max-w-full flex-initial font-normal leading-none'>
        {source.name}
      </div>
      <div
        className='flex flex-auto flex-row-reverse'
        onClick={() => onRemove(source)}
      >
        <div>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='100%'
            height='100%'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='feather feather-x hover:text-indigo ml-2 h-4 w-4 cursor-pointer rounded-full'
          >
            <line
              x1='18'
              y1='6'
              x2='6'
              y2='18'
            ></line>
            <line
              x1='6'
              y1='6'
              x2='18'
              y2='18'
            ></line>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Source;

import { getClientList } from "@/api/queries/fetch";
import { ChipSelectorOption } from "@/components/ChipSelector";
import { STORAGE_KEY } from "@/constants/localStorageKey";
import { ClientModel } from "@/types/clients";
import { useCallback, useEffect, useMemo, useState } from "react";

const useGetClientList = (
  clientCodeList?: string[],
  onError?: (err: any) => void
) => {
  // const [clientList, setClientList] = useState<ClientManagmentModel[]>([]);
  const [clientOptions, setClientOptions] = useState<ChipSelectorOption[]>([]);

  const localClientList = useMemo(
    () => localStorage.getItem(STORAGE_KEY.CLIENT_LIST),
    []
  );

  const getData = useCallback(async () => {
    let data: ClientModel[] = [];
    if (localClientList) {
      data = JSON.parse(localClientList) as ClientModel[];
    } else {
      data = await getClientList({})
        .then((res) => res.data.data)
        .catch((err) => {
          if (onError) onError(err);

          return [] as ClientModel[];
        });
    }

    localStorage.setItem(STORAGE_KEY.CLIENT_LIST, JSON.stringify(data));

    const dummyOptions: ChipSelectorOption[] = data?.map((e) => ({
      value: e.code,
      label: `${e.code} - ${e.client_name}`,
      selected: !!clientCodeList?.includes(e.code),
    }));

    setClientOptions(dummyOptions);
  }, [clientCodeList, localClientList, onError]);

  useEffect(() => {
    getData();
  }, [getData]);

  return clientOptions;
};

export default useGetClientList;

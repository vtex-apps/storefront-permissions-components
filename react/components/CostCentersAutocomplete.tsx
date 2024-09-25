import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { AutocompleteInput } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

import { messages } from './customers-admin'
import GET_COST from '../queries/costCentersByOrg.gql'

interface Props {
  onChange: (value: { value: string | null; label: string }) => void
  organizationId?: string
}

const initialState = {
  search: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'ASC',
  sortedBy: 'name',
}

const CostCenterAutocomplete = ({ onChange, organizationId }: Props) => {
  const { formatMessage } = useIntl()
  const [costCenterTextInput, setCostCenterTextInput] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState(costCenterTextInput)

  const { data, loading, refetch } = useQuery(GET_COST, {
    variables: {
      ...initialState,
      id: organizationId,
    },
    ssr: false,
    notifyOnNetworkStatusChange: true,
    skip: !organizationId,
  })

  const onClear = () => {
    setCostCenterTextInput('')
    onChange({ value: null, label: '' })
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(costCenterTextInput)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(handler)
    }
  }, [costCenterTextInput])

  useEffect(() => {
    if (debouncedSearchTerm) {
      refetch({
        ...initialState,
        id: organizationId,
        search: debouncedSearchTerm,
      })
    } else if (debouncedSearchTerm === '') {
      onClear()
    }
  }, [debouncedSearchTerm])

  const options = {
    maxHeight: 200,
    onSelect: onChange,
    loading,
    value: data?.getCostCentersByOrganizationId?.data?.map(
      (costCenter: { id: string; name: string }) => ({
        value: costCenter.id,
        label: costCenter.name,
      })
    ),
  }

  const input = {
    onChange: (_term: string) => {
      setCostCenterTextInput(_term)
    },
    onClear,
    placeholder: formatMessage(messages.costCenter),
    value: costCenterTextInput,
  }

  return <AutocompleteInput input={input} options={options} />
}

export default CostCenterAutocomplete

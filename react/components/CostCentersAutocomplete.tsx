import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { EXPERIMENTAL_Select } from 'vtex.styleguide'

import { messages } from './customers-admin'
import GET_COST_CENTER_BY_ORG from '../queries/costCentersByOrg.gql'
import { SEARCH_TERM_DELAY_MS } from '../constants/debounceDelay'

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

  const { data, loading, refetch } = useQuery(GET_COST_CENTER_BY_ORG, {
    variables: {
      ...initialState,
      id: organizationId,
    },
    ssr: false,
    notifyOnNetworkStatusChange: true,
    skip: !organizationId,
  })

  const options =
    data?.getCostCentersByOrganizationId?.data?.map(
      (costCenter: { id: string; name: string }) => ({
        value: costCenter.id,
        label: costCenter.name,
      })
    ) || []

  const handleSearchInputChange = (searchInput: string | null) => {
    setCostCenterTextInput(searchInput ?? '')
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(costCenterTextInput)
    }, SEARCH_TERM_DELAY_MS) // 500ms delay

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
      refetch({
        ...initialState,
        id: organizationId,
        search: '',
      })
      onChange({ value: null, label: '' })
    }
  }, [debouncedSearchTerm])

  const handleChange = (
    selectedOption: { value: string | null; label: string } | null
  ) => {
    if (!selectedOption || !selectedOption.value) {
      setCostCenterTextInput('')
      refetch({
        ...initialState,
        id: organizationId,
        search: '',
      })
    }

    onChange(selectedOption ?? { value: null, label: '' })
  }

  return (
    <EXPERIMENTAL_Select
      onSearchInputChange={handleSearchInputChange}
      onChange={handleChange}
      loading={loading}
      options={options}
      placeholder={formatMessage(messages.costCenter)}
      multi={false}
      valuesMaxHeight={200}
      claerable={true}
    />
  )
}

export default CostCenterAutocomplete

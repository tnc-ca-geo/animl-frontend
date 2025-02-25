import React, { useMemo, useRef, } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { VList } from 'virtua';
import { Image } from '../../components/Image.jsx';

const Row = styled('div', {
  display: 'flex'
})

const RowImage = styled(Image, {
})

const intoChunks = (arr, chunkSize) => {
  return arr.reduce((res, item, idx) => {
    const chunkIdx = Math.floor(idx/chunkSize)
    if (res[chunkIdx] === undefined) {
      res[chunkIdx] = []
    }
    res[chunkIdx].push(item)

    return res
  }, [])
}

const makeRows = (images, gridWidth = 3) => {
  if (images === undefined) return (<>None</>)
  const rows = intoChunks(images, gridWidth)
  return rows.map((row, idx) => {
    const uniqueRowId = `${idx}-${row.map((img) => img._id).join("")}`
    return (
      <Row key={uniqueRowId}>
        { row.map((img) => <RowImage key={img._id } src={img.thumbUrl} />) }
      </Row>
    )
  })
}

export const ImagesGrid = ({ workingImages, hasNext, loadNextPage }) => {
  const ref = useRef(null)
  /* eslint-disable */
  const [gridWidth, setGridWitdth] = useState(5)
  /* eslint-enable */
  const images = useMemo(() => makeRows(workingImages, gridWidth), [workingImages, gridWidth])
  const fetchedCountRef = useRef(-1)
  const count = workingImages.length

  const handleScroll = async () => {
    if (!ref.current) {
      return
    }

    if (
      fetchedCountRef.current < count &&
      (gridWidth * ref.current.findEndIndex()) + (50 * gridWidth) > count &&
      hasNext
    ) {
      fetchedCountRef.current = count
      await loadNextPage()
    }
  }
 
  return (
    <VList
      ref={ref}
      onScroll={async () => await handleScroll()}
    >
      { images }
    </VList>
  )
}

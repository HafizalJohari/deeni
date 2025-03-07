    -- Add coordinates columns to jakim_zones table
    ALTER TABLE jakim_zones
    ADD COLUMN IF NOT EXISTS latitude double precision,
    ADD COLUMN IF NOT EXISTS longitude double precision;

    -- Update coordinates for existing zones
    UPDATE jakim_zones
    SET 
        latitude = CASE code
            -- Wilayah Persekutuan
            WHEN 'WLY01' THEN 3.1390
            WHEN 'WLY02' THEN 5.2831
            -- Selangor
            WHEN 'SGR01' THEN 3.0833
            WHEN 'SGR02' THEN 3.2333
            WHEN 'SGR03' THEN 3.0440
            WHEN 'SGR04' THEN 3.3500
            WHEN 'SGR05' THEN 3.7986
            WHEN 'SGR06' THEN 3.0698
            WHEN 'SGR07' THEN 2.6889
            WHEN 'SGR08' THEN 3.6667
            WHEN 'SGR09' THEN 2.8259
            -- Johor
            WHEN 'JHR01' THEN 1.4853
            WHEN 'JHR02' THEN 1.8500
            WHEN 'JHR03' THEN 2.0361
            WHEN 'JHR04' THEN 1.7361
            -- Kedah
            WHEN 'KDH01' THEN 6.1167
            WHEN 'KDH02' THEN 5.6500
            WHEN 'KDH03' THEN 6.4414
            WHEN 'KDH04' THEN 5.7667
            WHEN 'KDH05' THEN 5.3667
            -- Kelantan
            WHEN 'KTN01' THEN 6.1333
            WHEN 'KTN02' THEN 5.8167
            WHEN 'KTN03' THEN 4.7500
            -- Melaka
            WHEN 'MLK01' THEN 2.1889
            WHEN 'MLK02' THEN 2.4000
            WHEN 'MLK03' THEN 2.3667
            -- Negeri Sembilan
            WHEN 'NGS01' THEN 2.7167
            WHEN 'NGS02' THEN 2.5167
            WHEN 'NGS03' THEN 2.8833
            -- Pahang
            WHEN 'PHG01' THEN 3.8077
            WHEN 'PHG02' THEN 4.2167
            WHEN 'PHG03' THEN 3.9333
            WHEN 'PHG04' THEN 3.5167
            WHEN 'PHG05' THEN 3.7500
            WHEN 'PHG06' THEN 4.4500
            -- Perlis
            WHEN 'PLS01' THEN 6.4333
            -- Pulau Pinang
            WHEN 'PNG01' THEN 5.4145
            WHEN 'PNG02' THEN 5.3500
            -- Perak
            WHEN 'PRK01' THEN 4.5841
            WHEN 'PRK02' THEN 4.8500
            WHEN 'PRK03' THEN 4.2167
            WHEN 'PRK04' THEN 4.5833
            WHEN 'PRK05' THEN 3.7833
            WHEN 'PRK06' THEN 5.1333
            WHEN 'PRK07' THEN 4.0167
            -- Terengganu
            WHEN 'TRG01' THEN 5.3302
            WHEN 'TRG02' THEN 4.7167
            WHEN 'TRG03' THEN 5.7167
            WHEN 'TRG04' THEN 4.2333
            -- Sabah
            WHEN 'SBH01' THEN 5.9749
            WHEN 'SBH02' THEN 5.3333
            WHEN 'SBH03' THEN 4.2500
            WHEN 'SBH04' THEN 5.0167
            WHEN 'SBH05' THEN 4.6000
            WHEN 'SBH06' THEN 6.8833
            WHEN 'SBH07' THEN 4.4167
            WHEN 'SBH08' THEN 5.0333
            WHEN 'SBH09' THEN 4.9167
            -- Sarawak
            WHEN 'SWK01' THEN 1.5500
            WHEN 'SWK02' THEN 2.3167
            WHEN 'SWK03' THEN 4.4000
            WHEN 'SWK04' THEN 2.9083
            WHEN 'SWK05' THEN 1.8667
            WHEN 'SWK06' THEN 2.0167
            WHEN 'SWK07' THEN 3.2000
            WHEN 'SWK08' THEN 2.1167
            WHEN 'SWK09' THEN 4.5833
        END,
        longitude = CASE code
            -- Wilayah Persekutuan
            WHEN 'WLY01' THEN 101.6869
            WHEN 'WLY02' THEN 115.2308
            -- Selangor
            WHEN 'SGR01' THEN 101.5333
            WHEN 'SGR02' THEN 101.7500
            WHEN 'SGR03' THEN 101.4480
            WHEN 'SGR04' THEN 101.2500
            WHEN 'SGR05' THEN 101.5322
            WHEN 'SGR06' THEN 101.7937
            WHEN 'SGR07' THEN 101.7417
            WHEN 'SGR08' THEN 101.1167
            WHEN 'SGR09' THEN 101.7952
            -- Johor
            WHEN 'JHR01' THEN 103.7618
            WHEN 'JHR02' THEN 103.7500
            WHEN 'JHR03' THEN 102.5705
            WHEN 'JHR04' THEN 103.9194
            -- Kedah
            WHEN 'KDH01' THEN 100.3667
            WHEN 'KDH02' THEN 100.4833
            WHEN 'KDH03' THEN 100.1986
            WHEN 'KDH04' THEN 100.7333
            WHEN 'KDH05' THEN 100.5667
            -- Kelantan
            WHEN 'KTN01' THEN 102.2500
            WHEN 'KTN02' THEN 102.1500
            WHEN 'KTN03' THEN 101.9667
            -- Melaka
            WHEN 'MLK01' THEN 102.2511
            WHEN 'MLK02' THEN 102.2333
            WHEN 'MLK03' THEN 102.4167
            -- Negeri Sembilan
            WHEN 'NGS01' THEN 101.9333
            WHEN 'NGS02' THEN 102.0333
            WHEN 'NGS03' THEN 102.2667
            -- Pahang
            WHEN 'PHG01' THEN 103.3260
            WHEN 'PHG02' THEN 101.9333
            WHEN 'PHG03' THEN 102.6000
            WHEN 'PHG04' THEN 101.9167
            WHEN 'PHG05' THEN 102.4167
            WHEN 'PHG06' THEN 103.4167
            -- Perlis
            WHEN 'PLS01' THEN 100.1833
            -- Pulau Pinang
            WHEN 'PNG01' THEN 100.3294
            WHEN 'PNG02' THEN 100.4667
            -- Perak
            WHEN 'PRK01' THEN 101.0829
            WHEN 'PRK02' THEN 100.7333
            WHEN 'PRK03' THEN 100.7000
            WHEN 'PRK04' THEN 101.4167
            WHEN 'PRK05' THEN 101.0167
            WHEN 'PRK06' THEN 100.6167
            WHEN 'PRK07' THEN 101.2500
            -- Terengganu
            WHEN 'TRG01' THEN 103.1408
            WHEN 'TRG02' THEN 103.4167
            WHEN 'TRG03' THEN 102.5500
            WHEN 'TRG04' THEN 103.4167
            -- Sabah
            WHEN 'SBH01' THEN 116.0724
            WHEN 'SBH02' THEN 116.1667
            WHEN 'SBH03' THEN 117.8833
            WHEN 'SBH04' THEN 118.3333
            WHEN 'SBH05' THEN 116.6667
            WHEN 'SBH06' THEN 116.8500
            WHEN 'SBH07' THEN 118.6000
            WHEN 'SBH08' THEN 115.5667
            WHEN 'SBH09' THEN 115.0833
            -- Sarawak
            WHEN 'SWK01' THEN 110.3333
            WHEN 'SWK02' THEN 111.8167
            WHEN 'SWK03' THEN 113.9833
            WHEN 'SWK04' THEN 112.9100
            WHEN 'SWK05' THEN 109.7667
            WHEN 'SWK06' THEN 111.6333
            WHEN 'SWK07' THEN 113.1167
            WHEN 'SWK08' THEN 111.1333
            WHEN 'SWK09' THEN 115.4167
        END
    WHERE code IN (
        'WLY01', 'WLY02',
        'SGR01', 'SGR02', 'SGR03', 'SGR04', 'SGR05', 'SGR06', 'SGR07', 'SGR08', 'SGR09',
        'JHR01', 'JHR02', 'JHR03', 'JHR04',
        'KDH01', 'KDH02', 'KDH03', 'KDH04', 'KDH05',
        'KTN01', 'KTN02', 'KTN03',
        'MLK01', 'MLK02', 'MLK03',
        'NGS01', 'NGS02', 'NGS03',
        'PHG01', 'PHG02', 'PHG03', 'PHG04', 'PHG05', 'PHG06',
        'PLS01',
        'PNG01', 'PNG02',
        'PRK01', 'PRK02', 'PRK03', 'PRK04', 'PRK05', 'PRK06', 'PRK07',
        'TRG01', 'TRG02', 'TRG03', 'TRG04',
        'SBH01', 'SBH02', 'SBH03', 'SBH04', 'SBH05', 'SBH06', 'SBH07', 'SBH08', 'SBH09',
        'SWK01', 'SWK02', 'SWK03', 'SWK04', 'SWK05', 'SWK06', 'SWK07', 'SWK08', 'SWK09'
    ); 
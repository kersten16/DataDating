import json
import datetime
import os

def remove_convo():
    with open("allDates_ByCountry.json",'r',encoding='utf-8') as dating_data:
        with open("allDates_Covid.json",'r',encoding='utf-8') as covid_data:
            dating = json.load(dating_data)
            covid = json.load(covid_data)
            for element in dating:                          
                try:
                    filteredCovid=list(filter(lambda x:(x["country"]==element["country"] and x["date"]==element["date"]),covid))
                    print(len(filteredCovid))
                    if(len(filteredCovid)==0):
                        element["daysSince"]=50
                        element["category"] = "None"
                        element["measure"] = "None"
                        
                    else:
                        element["daysSince"]=filteredCovid[0]["daysSince"]
                        element["category"] = filteredCovid[0]["category"]
                        element["measure"] = filteredCovid[0]["measure"]

                except KeyError:
                    pass
    json_object = json.dumps(dating,indent=4)
    with open('allDates_Combined.json','w') as output_file:
        output_file.write(json_object)
    return


if __name__ == "__main__":
    remove_convo()

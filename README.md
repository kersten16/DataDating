# Online Dating during COVID19 Pandemic
Universite Paris Saclay Interactive Information Visualization

[Visuals HERE](https://kersten16.github.io/DataDating/docs)

## What are the visualizations and how to read them

There are three visualizations available to users. The main overview consists of a radial chart that tracks the average number of times users open their apps per country each day along a timescale. From here, users can hover on the country names to see an overview for the amount of swipes and messages sent in the day and click on a data point to see more user specific information.

#### Available Interactions:
- Hover on country names
- Slide through timeline
- Hover on data point
- Click on data point (to reach scatter plot)

#### Radial lollipop:
This chart shows the average number of times a user opened their app on the given day per country (encoded in length), and also shows how recently a preventative COVID measure was announced for each country. There is a time slider to scroll through different available dates. This allows a comparison in user activity for each country and whether the region was under isolating restrictions.

#### Timeline:
To better navigate through the Scatterplot we also have a timeline. Due to different versions of D3, we currently have problems to combine the scatterplot and the timeline. 

#### Icon cloud:
The cloud is made of icons, hearts represent swipes (pass or like) and message icons represent messages sent by a given user. Each full size icon represents 10 counts and if there are any leftovers, an icon scaled by that amount (for example if there was 64 messages, there would be 6 full sized icons and one icon at 4/10th of the size). This allows viewers to gauge the proportion of activity allocated to swiping vs messages.

#### Scatterplot: [Visual HERE](https://kersten16.github.io/DataDating/ScatterPlot/)
The scatterplot displays a country's historical user activity over time. The size of the dot serves as a proxy for user activity, with a larger dot signifying higher user activity. The type of covid-19 measurement on that particular day is currently represented by a coloured mark on the timeline. As a default, the graph's x-axis depicts the number of messages, and the y-axis displays the number of user swipes. The viewable data, however, can be altered by the user. This graph enables a comparison of user activity before, during, and after the announcement of a COVID preventative intervention.

### Who are these visualizations for and why should they care
Our original target audience was researchers interested in how COVID-19 affected online dating behaviour specifically, if users took actions that indicated more meaningful connections (such as an increase in messaging) or if they relied on online socialization more than before (number of times they open the app). This could help target mental health campaigns and guide policy making in the future. As we created our design we realized that this information may be more useful to dating platforms. Knowing how user behaviour changes with environmental events can guide the timing of updates, marketing, when there may be pressure on memory and bandwidth, etc. Further analysis on whether any correlation is present of significant would need to occur before any meaningful conclusions can be drawn. Because this visualization focuses more on presenting an idea (that COVID policies may have affected online dating practices) rather than proves a hypothesis, it primarily serves as inspiration for further more detailed research on the topic. As such, the principle audience would have to be researchers.

